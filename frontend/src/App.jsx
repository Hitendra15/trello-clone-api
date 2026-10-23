import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth/AuthContext'
import { ThemeProvider, useTheme } from './theme/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Boards from './pages/Boards'
import Board from './pages/Board'
import Tasks from './pages/Tasks'
import NotFound from './pages/NotFound'

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="bottom-right" closeButton toastOptions={{ style: { fontFamily: 'var(--font-ui)' } }} />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="boards" element={<Boards />} />
                <Route path="boards/:boardId" element={<Board />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
          <ThemedToaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
