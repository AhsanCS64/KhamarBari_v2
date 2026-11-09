import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SproutLoader from '@/components/common/SproutLoader'

export default function ProtectedRoute({ children }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream">
        <SproutLoader label="Loading…" />
      </div>
    )
  }
  if (status !== 'authenticated') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return children
}