import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { authApi } from '../api'
import { tokens, setAuthLostHandler } from '../api/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'loading' while we check a stored session, then 'authed' | 'anon'
  const [status, setStatus] = useState(() => (tokens.access || tokens.refresh ? 'loading' : 'anon'))

  const signOut = useCallback(() => {
    tokens.clear()
    setUser(null)
    setStatus('anon')
  }, [])

  // If a token refresh fails anywhere in the app, drop back to the login screen.
  useEffect(() => {
    setAuthLostHandler(() => {
      signOut()
      toast.error('Your session expired. Please sign in again.')
    })
  }, [signOut])

  // Restore an existing session on first load.
  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    authApi.profile()
      .then((profile) => { if (!cancelled) { setUser(profile); setStatus('authed') } })
      .catch(() => { if (!cancelled) signOut() })
    return () => { cancelled = true }
  }, [status, signOut])

  const startSession = useCallback(async ({ token }) => {
    tokens.set(token)
    const profile = await authApi.profile()
    setUser(profile)
    setStatus('authed')
  }, [])

  const signIn = useCallback(async (email, password) => {
    await startSession(await authApi.login(email, password))
  }, [startSession])

  // The API returns tokens on registration, so the new user is signed in straight away.
  const signUp = useCallback(async (payload) => {
    await startSession(await authApi.register(payload))
  }, [startSession])

  const value = useMemo(
    () => ({ user, status, signIn, signUp, signOut }),
    [user, status, signIn, signUp, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
