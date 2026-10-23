import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, SquareKanban, ListChecks, Sun, Moon, LogOut, Menu as MenuIcon, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { initials } from '../lib/format'
import Logo from './Logo'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/boards', label: 'Boards', icon: SquareKanban },
  { to: '/tasks', label: 'My tasks', icon: ListChecks },
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer after navigating.
  useEffect(() => { setOpen(false) }, [location.pathname])

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'You'

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="btn btn-quiet btn-icon" onClick={() => setOpen(true)} aria-label="Open navigation">
          <MenuIcon size={22} />
        </button>
        <span className="brand"><Logo size={26} /> Trello Clone</span>
        <span className="avatar" aria-hidden="true">{initials(user?.first_name, user?.last_name)}</span>
      </header>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Primary">
        <div className="sidebar-top">
          <span className="brand"><Logo /> Trello Clone</span>
          <button type="button" className="btn btn-quiet btn-icon btn-sm close-drawer" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="nav-link" onClick={toggle}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            {theme === 'dark' ? 'Light theme' : 'Dark theme'}
          </button>
          <div className="user-chip">
            <span className="avatar">{initials(user?.first_name, user?.last_name)}</span>
            <span className="user-name truncate">{fullName}</span>
            <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
