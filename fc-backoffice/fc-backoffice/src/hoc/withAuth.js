import { useAuth } from '../contexts/AuthContext'
import Login from '../pages/Login'

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth()

    if (loading) return (
      <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-hint)', fontSize: 'var(--text-md)' }}>불러오는 중...</p>
      </div>
    )

    if (!user) return <Login />

    return <Component {...props} />
  }
}