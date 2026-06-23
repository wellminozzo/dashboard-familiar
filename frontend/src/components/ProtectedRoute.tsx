import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/auth"
import type { ReactNode } from "react"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token)
  const loading = useAuthStore((s) => s.loading)
  const loadUser = useAuthStore((s) => s.loadUser)
  const location = useLocation()

  useEffect(() => {
    if (token) {
      loadUser()
    }
  }, [token, loadUser])

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
