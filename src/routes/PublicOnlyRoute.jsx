import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function PublicOnlyRoute({ children }) {
  const status = useAuthStore((s) => s.status)
  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}