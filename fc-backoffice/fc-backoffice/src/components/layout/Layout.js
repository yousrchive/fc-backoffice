import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import '../../styles/Layout.css'

export default function Layout({ children }) {
  const { profile } = useAuth()

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
            <button className="nav-item active">고객</button>
            <button className="nav-item">캘린더</button>
            <button className="nav-item">발화모음</button>
            <button className="nav-item">대시보드</button>
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