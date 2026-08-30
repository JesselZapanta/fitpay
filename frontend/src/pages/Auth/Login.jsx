import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import GymAnimatedBg from "@/components/GymAnimatedBg"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      const dest = location.state?.from?.pathname
      if (dest) navigate(dest, { replace: true })
      else navigate(u.role === "admin" ? "/admin/dashboard" : "/member/dashboard", { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again."
      const errors = err.response?.data?.errors
      if (errors) setError(Object.values(errors)[0]?.[0] || msg)
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@fitpay.test", password: "password" })
    else setForm({ email: "member@fitpay.test", password: "password" })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[var(--surface-0)]">
      <div className="absolute inset-0 overflow-hidden">
        <GymAnimatedBg variant="login" />
      </div>

      <div className="absolute top-6 left-6 hidden lg:flex items-center gap-2.5 z-20">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[var(--charge-500)] shadow-lg">
          <Dumbbell className="size-5" />
        </div>
        <div>
          <div className="font-display font-bold text-sm leading-none text-white drop-shadow">FitPay</div>
          <div className="text-[10px] tracking-widest uppercase font-semibold text-white/80">Charge and Grow</div>
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-[420px] shadow-2xl border-white/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[var(--charge-500)] text-white shadow-md">
            <Dumbbell className="size-6" />
          </div>
          <div>
            <CardTitle className="font-display text-[22px] font-semibold text-[var(--ink-900)]">Welcome back</CardTitle>
            <CardDescription className="text-[13px] text-[var(--ink-600)] mt-1">Sign in to your gym workspace</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="flex gap-3 rounded-lg border border-[#FBE2E2] bg-[#FBE2E2] px-3 py-3 text-sm text-[#C43D3D]">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--ink-900)]">Email <span className="text-[#C43D3D]">*</span></Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@fitpay.test"
                required
                autoComplete="email"
                className="h-12 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--ink-900)]">Password <span className="text-[#C43D3D]">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-lg border-[var(--ink-300)] bg-white pr-11 focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-[var(--ink-600)] hover:bg-muted hover:text-[var(--ink-900)] transition-colors"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-lg bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[15px] shadow-sm min-h-12">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Signing in...</> : "Sign In"}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-[var(--ink-600)]">
              <span className="h-px flex-1 bg-[var(--ink-300)]" /> Demo accounts <span className="h-px flex-1 bg-[var(--ink-300)]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fillDemo("admin")} className="group flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ink-300)] bg-white px-3 py-3 text-left hover:border-[var(--charge-500)] hover:bg-[var(--charge-100)] transition-colors min-h-11">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white border border-[var(--ink-300)] text-[var(--charge-500)] group-hover:bg-white shadow-sm">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-bold text-[var(--ink-900)]">Admin</span>
                  <span className="block text-[11px] text-[var(--ink-600)]">admin@fitpay.test</span>
                </span>
              </button>
              <button type="button" onClick={() => fillDemo("member")} className="group flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ink-300)] bg-white px-3 py-3 text-left hover:border-[var(--grow-500)] hover:bg-[var(--grow-100)] transition-colors min-h-11">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white border border-[var(--ink-300)] text-[var(--grow-500)] shadow-sm">
                  <User className="size-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-bold text-[var(--ink-900)]">Member</span>
                  <span className="block text-[11px] text-[var(--ink-600)]">member@fitpay.test</span>
                </span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--ink-600)]">
            No account? <Link to="/register" className="font-semibold text-[var(--charge-500)] hover:text-[var(--charge-600)] hover:underline">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
