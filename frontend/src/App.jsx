import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Login from "@/pages/Auth/Login"
import Register from "@/pages/Auth/Register"
import AdminDashboard from "@/pages/Admin/Dashboard"
import MemberDashboard from "@/pages/Member/Dashboard"
import MemberMembership from "@/pages/Member/Membership"
import AdminMembers from "@/pages/Admin/Members"
import AdminMembershipRequests from "@/pages/Admin/MembershipRequests"
import AdminMembershipRequestShow from "@/pages/Admin/MembershipRequestShow"
import AdminMemberships from "@/pages/Admin/Memberships"
import AdminPayments from "@/pages/Admin/Payments"
import AdminAttendance from "@/pages/Admin/Attendance"
import AdminReports from "@/pages/Admin/Reports"
import MemberAttendance from "@/pages/Member/Attendance"
import MemberHistory from "@/pages/Member/History"
import MemberReports from "@/pages/Member/Reports"
import Profile from "@/pages/Profile/Index"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import { Card, CardContent } from "@/components/ui/card"
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
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/member/dashboard"} replace />
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
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/member/dashboard"} replace />
}

function AdminPlaceholder({ title }) {
  return (
    <AdminLayout title={title}>
      <Card className="border-[var(--ink-300)] bg-white">
        <CardContent className="p-8 sm:p-12 text-center space-y-2">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Admin</div>
          <div className="font-display font-semibold text-lg text-[var(--ink-900)]">{title}</div>
          <p className="text-sm text-[var(--ink-600)] max-w-[40ch] mx-auto">This section is coming soon. The route is already role-prefixed as <span className="font-mono text-xs bg-[var(--surface-0)] border border-[var(--ink-300)] px-1.5 py-0.5 rounded">/admin/{String(title).toLowerCase().replace(/\s+/g, "-")}</span>.</p>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

function MemberPlaceholder({ title }) {
  return (
    <MemberLayout title={title}>
      <Card className="border-[var(--ink-300)] bg-white">
        <CardContent className="p-8 sm:p-12 text-center space-y-2">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Member</div>
          <div className="font-display font-semibold text-lg text-[var(--ink-900)]">{title}</div>
          <p className="text-sm text-[var(--ink-600)] max-w-[40ch] mx-auto">This section is coming soon. The route is already role-prefixed as <span className="font-mono text-xs bg-[var(--surface-0)] border border-[var(--ink-300)] px-1.5 py-0.5 rounded">/member/{String(title).toLowerCase().replace(/\s+/g, "-")}</span>.</p>
        </CardContent>
      </Card>
    </MemberLayout>
  )
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

          {/* Admin — role-prefixed */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membership-requests"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminMembershipRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membership-requests/:id"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminMembershipRequestShow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Admin placeholder sections — already prefixed, components coming soon */}
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/memberships"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminMemberships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Member — role-prefixed */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/membership"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberMembership />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/profile"
            element={
              <ProtectedRoute roles={["member"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/attendance"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/history"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/reports"
            element={
              <ProtectedRoute roles={["member"]}>
                <MemberReports />
              </ProtectedRoute>
            }
          />

          {/* Generic / backwards-compat redirects — all routes now role-prefixed */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
          <Route path="/members" element={<Navigate to="/admin/members" replace />} />
          <Route path="/attendance" element={<Navigate to="/admin/attendance" replace />} />
          <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
          <Route path="/memberships" element={<Navigate to="/admin/memberships" replace />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
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
