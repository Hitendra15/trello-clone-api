import { request, fetchAll } from './http'

/** One function per backend endpoint, grouped by resource. */

export const authApi = {
  login: (email, password) => request('/login/', { method: 'POST', auth: false, body: { email, password } }),
  register: (payload) => request('/register/', { method: 'POST', auth: false, body: payload }),
  profile: () => request('/profile/'),
}

export const dashboardApi = {
  get: () => request('/dashboard/'),
}

export const boardsApi = {
  list: () => fetchAll('/boards/'),
  get: (id) => request(`/boards/${id}/`),
  create: (body) => request('/boards/', { method: 'POST', body }),
  update: (id, body) => request(`/boards/${id}/`, { method: 'PATCH', body }),
  remove: (id) => request(`/boards/${id}/`, { method: 'DELETE' }),
  lists: (id) => fetchAll(`/boards/${id}/lists/`),
}

export const listsApi = {
  all: () => fetchAll('/lists/'),
  // The nested route still validates `board` from the body.
  create: (boardId, body) => request(`/boards/${boardId}/lists/`, { method: 'POST', body: { ...body, board: boardId } }),
  update: (id, body) => request(`/lists/${id}/`, { method: 'PATCH', body }),
  remove: (id) => request(`/lists/${id}/`, { method: 'DELETE' }),
}

export const tasksApi = {
  all: (params) => fetchAll('/tasks/', params),
  /** One server-side page, with ?search= ?status= ?ordering= ?page= */
  page: (params) => request('/tasks/', { params }),
  ofList: (listId) => fetchAll(`/lists/${listId}/tasks/`),
  create: (body) => request('/tasks/', { method: 'POST', body }),
  update: (id, body) => request(`/tasks/${id}/`, { method: 'PATCH', body }),
  remove: (id) => request(`/tasks/${id}/`, { method: 'DELETE' }),
  markDone: (id) => request(`/tasks/${id}/mark_done/`, { method: 'POST' }),
}
