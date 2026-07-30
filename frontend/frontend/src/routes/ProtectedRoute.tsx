import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const isTokenValid = useAuthStore((s) => s.isTokenValid)
  const onboarded = useAuthStore((s) => s.onboarded)
  const location = useLocation()

  if (!isTokenValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

export function OnboardingRoute() {
  const isTokenValid = useAuthStore((s) => s.isTokenValid)
  const onboarded = useAuthStore((s) => s.onboarded)

  if (!isTokenValid()) return <Navigate to="/login" replace />
  if (onboarded) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const isTokenValid = useAuthStore((s) => s.isTokenValid)
  const onboarded = useAuthStore((s) => s.onboarded)

  if (isTokenValid()) {
    return <Navigate to={onboarded ? '/dashboard' : '/onboarding'} replace />
  }
  return <Outlet />
}
