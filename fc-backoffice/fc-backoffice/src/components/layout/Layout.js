import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import '../../styles/Layout.css'

const NAV_ITEMS = [
  { label: 'HOME', path: '/customers' },
  { label: '고객', path: '/customer-list' },
  { label: '캘린더', path: '/calendar' },
  { label: '발화모음', path: '/templates' },
  { label: '대시보드', path: '/dashboard' },
]

export default function Layout({ children }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await authService.signOut()
  }

  const initial = profile?.name ? profile.name.charAt(0) : '?'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="FC Backoffice Logo" className="logo-img" />
          </div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-info">
              <p className="profile-name">{profile?.name}</p>
              <p className="profile-team">{profile?.team} {profile?.squad}</p>
            </div>
          </div>
          <button className="signout-btn" onClick={handleSignOut}>로그아웃</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}