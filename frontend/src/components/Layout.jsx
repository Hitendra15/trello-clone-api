import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../services/api'

import './Layout.css'


function Layout({ children, activePage, title }) {

    const navigate = useNavigate()

    const [user, setUser] = useState(null)


    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {

        const accessToken = localStorage.getItem('access_token')

        if (!accessToken) {
            navigate('/login')
            return
        }


        const loadUser = async () => {

            try {

                const response = await getDashboard(accessToken)

                console.log('Layout user response:', response)

                setUser(response?.data?.user || null)

            } catch (error) {

                console.error('Unable to load user:', error)

                if (error?.status === 401) {

                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')

                    navigate('/login')
                }
            }
        }


        loadUser()

    }, [navigate])


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        navigate('/login')
    }


    // =====================================================
    // INITIALS
    // =====================================================

    const getInitials = () => {

        const firstName = user?.first_name || ''
        const lastName = user?.last_name || ''


        const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`


        return initials.toUpperCase() || 'U'
    }


    // =====================================================
    // FULL NAME
    // =====================================================

    const getFullName = () => {

        const firstName = user?.first_name || ''
        const lastName = user?.last_name || ''


        return `${firstName} ${lastName}`.trim() || 'User'
    }


    return (

        <div className="app-layout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="app-sidebar">


                {/* BRAND */}

                <div className="sidebar-brand">

                    <div className="sidebar-brand-icon">
                        T
                    </div>

                    <span>
                        Trello Clone
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <span className="sidebar-section-title">
                        WORKSPACE
                    </span>


                    {/* DASHBOARD */}

                    <button
                        className={`sidebar-nav-item ${
                            activePage === 'dashboard'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            navigate('/dashboard')
                        }
                    >

                        <span className="nav-icon">
                            ▦
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </button>


                    {/* BOARDS */}

                    <button
                        className={`sidebar-nav-item ${
                            activePage === 'boards'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            navigate('/boards')
                        }
                    >

                        <span className="nav-icon">
                            ▤
                        </span>

                        <span>
                            Boards
                        </span>

                    </button>
                    
                    <button
                        className={`sidebar-nav-item ${
                            activePage === 'lists'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            navigate('/lists')
                        }
                    >

                        <span className="nav-icon">
                            ☷
                        </span>

                        <span>
                            Lists
                        </span>

                    </button>

                    {/* TASKS */}

                    <button
                        className={`sidebar-nav-item ${
                            activePage === 'tasks'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            navigate('/tasks')
                        }
                    >

                        <span className="nav-icon">
                            ✓
                        </span>

                        <span>
                            Tasks
                        </span>

                    </button>


                    <span className="sidebar-section-title sidebar-section-space">
                        ACCOUNT
                    </span>


                    {/* SETTINGS */}

                    <button
                        className={`sidebar-nav-item ${
                            activePage === 'settings'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            navigate('/settings')
                        }
                    >

                        <span className="nav-icon">
                            ⚙
                        </span>

                        <span>
                            Settings
                        </span>

                    </button>

                </nav>


                {/* =================================================
                    SIDEBAR USER
                ================================================= */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="sidebar-user-avatar">
                            {getInitials()}
                        </div>


                        <div className="sidebar-user-info">

                            <strong>
                                {getFullName()}
                            </strong>

                            <span>
                                Workspace member
                            </span>

                        </div>

                    </div>


                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="app-main">


                {/* =================================================
                    TOP NAVBAR
                ================================================= */}

                <header className="app-topbar">

                    <div className="topbar-page-info">

                        <span className="topbar-label">
                            WORKSPACE
                        </span>

                        <h2>
                            {title}
                        </h2>

                    </div>


                    <div className="topbar-right">

                        <button
                            className="notification-btn"
                            type="button"
                        >
                            🔔
                        </button>


                        <div className="topbar-profile">

                            <div className="topbar-avatar">
                                {getInitials()}
                            </div>


                            <div className="topbar-user-info">

                                <strong>
                                    {getFullName()}
                                </strong>

                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <div className="app-content">

                    {children}

                </div>

            </main>

        </div>
    )
}


export default Layout