import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import GymAnimatedBg from "@/components/GymAnimatedBg"

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" })
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const u = await register({ ...form, role: "member" })
      navigate(u.role === "admin" ? "/admin/dashboard" : "/member/dashboard", { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check your details."
      const errors = err.response?.data?.errors
      if (errors) setError(Object.values(errors)[0]?.[0] || msg)
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[var(--surface-0)]">
      <div className="absolute inset-0 overflow-hidden">
        <GymAnimatedBg variant="register" />
      </div>

      <div className="absolute top-6 left-6 hidden lg:flex items-center gap-2.5 z-20">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[var(--charge-500)] shadow-md">
          <Dumbbell className="size-5" />
        </div>
        <div>
          <div className="font-display font-bold text-sm leading-none text-white drop-shadow">FitPay</div>
          <div className="text-[10px] tracking-widest uppercase font-semibold text-white/80">Charge and Grow</div>
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-[440px] shadow-2xl border-white/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[var(--charge-500)] text-white shadow-md">
            <Dumbbell className="size-6" />
          </div>
          <div>
            <CardTitle className="font-display text-[22px] font-semibold text-[var(--ink-900)]">Create account</CardTitle>
            <CardDescription className="text-[13px] text-[var(--ink-600)] mt-1">Join FitPay — start charging, start growing</CardDescription>
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
              <Label htmlFor="name" className="text-sm font-medium text-[var(--ink-900)]">Full name <span className="text-[#C43D3D]">*</span></Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" required className="h-12 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--ink-900)]">Email <span className="text-[#C43D3D]">*</span></Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@fitpay.test" required autoComplete="email" className="h-12 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--ink-900)]">Password <span className="text-[#C43D3D]">*</span></Label>
                <div className="relative">
                  <Input id="password" type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required className="h-12 rounded-lg border-[var(--ink-300)] bg-white pr-11 focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-[var(--ink-600)] hover:bg-muted">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[var(--ink-600)]">Min 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-medium text-[var(--ink-900)]">Confirm <span className="text-[#C43D3D]">*</span></Label>
                <Input id="password_confirmation" type={show ? "text" : "password"} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} placeholder="••••••••" required className="h-12 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[15px]" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 cursor-pointer rounded-lg bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[15px] min-h-12 shadow-sm">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--ink-600)]">
            Already have an account? <Link to="/login" className="font-semibold text-[var(--charge-500)] hover:text-[var(--charge-600)] hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
