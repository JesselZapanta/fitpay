import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Login from "@/pages/Auth/Login"
import Register from "@/pages/Auth/Register"
import AdminDashboard from "@/pages/Dashboard/Admin"
import MemberDashboard from "@/pages/Dashboard/Member"
import MembersIndex from "@/pages/Members/Index"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"

function PublicRoute({ children }) {
  const { user, token, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--ink-300)] border-t-[var(--charge-500)]" />
      </div>
    )
  }
  if (token && user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/member"} replace />
  }
  return children
}

function RootRedirect() {
  const { user, token, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--ink-300)] border-t-[var(--charge-500)]" />
      </div>
    )
  }
  if (!token || !user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === "admin" ? "/admin" : "/member"} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute roles={["admin"]}>
                <MembersIndex />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton expand />
      </BrowserRouter>
    </AuthProvider>
  )
}
