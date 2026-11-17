import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/common/Loader'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Loader label="Loading KrishiSahay..." />
  if (!isAuthenticated) return <Navigate to="/welcome" replace />
  return <Outlet />
}
