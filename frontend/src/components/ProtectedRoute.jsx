import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--ink-300)] border-t-[var(--charge-500)]" />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : "/member"
    return <Navigate to={fallback} replace />
  }

  return children
}
