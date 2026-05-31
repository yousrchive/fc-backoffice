import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-hint)', fontSize: 'var(--text-md)' }}>불러오는 중...</p>
    </div>
  )

  if (!user) return <Login />

  return (
    <div>
      <p style={{ color: 'var(--text-primary)' }}>로그인 됐어요! {user.email}</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}