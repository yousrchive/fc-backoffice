import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth()

    if (loading) return (
      <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-hint)' }}>불러오는 중...</p>
      </div>
    )

    if (!user) return <Navigate to="/login" replace />

    return <Component {...props} />
  }
}