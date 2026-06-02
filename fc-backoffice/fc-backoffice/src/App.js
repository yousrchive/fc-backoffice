import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Customers from './pages/Customers'
import Calendar from './pages/Calendar'
import Templates from './pages/Templates'
import Dashboard from './pages/Dashboard'
import withAuth from './hoc/withAuth'
import CustomerDetail from './pages/CustomerDetail'

const ProtectedCustomers = withAuth(Customers)
const ProtectedCalendar = withAuth(Calendar)
const ProtectedTemplates = withAuth(Templates)
const ProtectedDashboard = withAuth(Dashboard)
const ProtectedCustomerDetail = withAuth(CustomerDetail)

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-hint)' }}>불러오는 중...</p>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/customers" /> : <Login />} />
      <Route path="/" element={<Navigate to="/customers" />} />
      <Route path="/customers" element={<Layout><ProtectedCustomers /></Layout>} />
      <Route path="/calendar" element={<Layout><ProtectedCalendar /></Layout>} />
      <Route path="/templates" element={<Layout><ProtectedTemplates /></Layout>} />
      <Route path="/dashboard" element={<Layout><ProtectedDashboard /></Layout>} />
      <Route path="/customers/:id" element={<Layout><ProtectedCustomerDetail /></Layout>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}