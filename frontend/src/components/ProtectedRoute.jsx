import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="center-screen" role="status" aria-label="Loading"><span className="spinner spinner-lg" /></div>
  }
  if (status === 'anon') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
