/**
 * Thin fetch wrapper around the Django REST API.
 *
 * Handles, in one place:
 *  - the { success, message, errors, data } response envelope
 *  - normalising the many error shapes DRF / SimpleJWT can return
 *  - JWT access-token refresh (single-flight) with one automatic retry
 *  - fetching every page of a paginated endpoint
 */

export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '')

/* ---------------------------------------------------------------- tokens */

const ACCESS_KEY = 'trello.access'
const REFRESH_KEY = 'trello.refresh'

const read = (key) => {
  try { return localStorage.getItem(key) } catch { return null }
}

export const tokens = {
  get access() { return read(ACCESS_KEY) },
  get refresh() { return read(REFRESH_KEY) },
  set({ access, refresh }) {
    try {
      if (access) localStorage.setItem(ACCESS_KEY, access)
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
    } catch { /* storage unavailable */ }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
    } catch { /* storage unavailable */ }
  },
}

let onAuthLost = () => {}
/** Called when the session can no longer be refreshed. */
export const setAuthLostHandler = (fn) => { onAuthLost = fn }

/* ---------------------------------------------------------------- errors */

export class ApiError extends Error {
  constructor({ status = 0, message, fields = {}, raw = null }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields // { fieldName: 'first message' }
    this.raw = raw
  }
}

const firstMessage = (value) => {
  if (Array.isArray(value)) return firstMessage(value[0])
  if (value && typeof value === 'object') return firstMessage(Object.values(value)[0])
  return value == null ? '' : String(value)
}

const prettyField = (name) => {
  const text = name.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Turns any DRF error payload into { message, fields }. */
function normalizeErrors(errors) {
  if (!errors) return { message: '', fields: {} }
  if (typeof errors === 'string') return { message: errors, fields: {} }

  // The login view nests its payload one level deeper: { errors: { non_field_errors } }
  if (errors.errors && typeof errors.errors === 'object') return normalizeErrors(errors.errors)

  const fields = {}
  let message = ''

  for (const [key, value] of Object.entries(errors)) {
    if (key === 'code' || key === 'messages') continue
    const text = firstMessage(value)
    if (!text) continue
    if (key === 'detail' || key === 'non_field_errors') message ||= text
    else fields[key] = text
  }

  if (!message) {
    const [field, text] = Object.entries(fields)[0] || []
    if (text) message = `${prettyField(field)}: ${text}`
  }
  return { message, fields }
}

/* --------------------------------------------------------------- request */

async function readBody(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

let refreshing = null

/** Exchanges the refresh token for a new access token. Concurrent callers share one request. */
function refreshAccessToken() {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh = tokens.refresh
      if (!refresh) throw new Error('no refresh token')

      const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      const body = await readBody(response)
      if (!response.ok || !body?.data?.access) throw new Error('refresh failed')

      // ROTATE_REFRESH_TOKENS is on, so a new refresh token comes back too.
      tokens.set({ access: body.data.access, refresh: body.data.refresh })
    })().finally(() => { refreshing = null })
  }
  return refreshing
}

const buildUrl = (path, params) => {
  const url = new URL(`${API_URL}${path}`)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })
  return url.toString()
}

export async function request(path, { method = 'GET', body, params, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({
      status: 0,
      message: `Can't reach the server at ${API_URL}. Check that the API is running.`,
    })
  }

  // Expired access token: refresh once, then replay the request.
  if (response.status === 401 && auth && retry && tokens.refresh) {
    try {
      await refreshAccessToken()
      return request(path, { method, body, params, auth, retry: false })
    } catch {
      tokens.clear()
      onAuthLost()
      throw new ApiError({ status: 401, message: 'Your session has expired. Please sign in again.' })
    }
  }

  const payload = await readBody(response)

  if (!response.ok) {
    const { message, fields } = normalizeErrors(payload?.errors ?? payload)
    throw new ApiError({
      status: response.status,
      message: message || (response.status >= 500 ? 'The server ran into a problem. Try again.' : 'Something went wrong.'),
      fields,
      raw: payload,
    })
  }

  // Unwrap the { success, data } envelope (DELETE returns data: null).
  return payload && 'data' in payload ? payload.data : payload
}

/**
 * Loads every page of a paginated endpoint. The API has a fixed page size,
 * so after page 1 the remaining pages are requested in parallel.
 */
export async function fetchAll(path, params = {}) {
  const first = await request(path, { params: { ...params, page: 1 } })
  if (Array.isArray(first)) return first
  if (!first?.next) return first?.results ?? []

  const pageSize = first.results.length || 1
  const pages = Math.ceil(first.count / pageSize)
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => request(path, { params: { ...params, page: i + 2 } })),
  )
  return [first, ...rest].flatMap((page) => page.results)
}
