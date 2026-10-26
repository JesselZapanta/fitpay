import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle, User, Phone, MapPin, CalendarDays, Lock, Check, ArrowLeft, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import GymAnimatedBg from "@/components/GymAnimatedBg"

const STEPS = [
  { id: 1, label: "Account", icon: User },
  { id: 2, label: "Member", icon: Phone },
  { id: 3, label: "Security", icon: Lock },
]

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "", phone: "", address: "", birthdate: "", gender: "" })
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.name.trim()) return "Full name is required."
      if (!form.email.trim()) return "Email is required."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email."
      return null
    }
    if (s === 2) {
      if (!form.phone?.trim()) return "Phone is required."
      if (!form.birthdate) return "Birthdate is required."
      if (!form.gender) return "Gender is required."
      if (!form.address?.trim()) return "Address is required."
      return null
    }
    if (s === 3) {
      if (!form.password) return "Password is required."
      if (form.password.length < 8) return "Password must be at least 8 characters."
      if (form.password !== form.password_confirmation) return "Passwords do not match."
      return null
    }
    return null
  }

  const handleNext = () => {
    const msg = validateStep(step)
    if (msg) { setError(msg); return }
    setError("")
    setStep((v) => Math.min(3, v + 1))
  }

  const handleBack = () => {
    setError("")
    setStep((v) => Math.max(1, v - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step !== 3) { handleNext(); return }
    setError("")
    const m1 = validateStep(1) || validateStep(2) || validateStep(3)
    if (m1) { setError(m1); if (validateStep(1)) setStep(1); else if (validateStep(2)) setStep(2); return }
    setLoading(true)
    try {
      const u = await register({ ...form, role: "member" })
      navigate(u.role === "admin" ? "/admin/dashboard" : "/member/dashboard", { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check your details."
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]?.[0] || msg
        setError(first)
        const keys = Object.keys(errors)
        if (keys.some(k => ["name","email"].includes(k))) setStep(1)
        else if (keys.some(k => ["phone","birthdate","gender","address"].includes(k))) setStep(2)
        else setStep(3)
      } else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-5 overflow-hidden bg-[var(--surface-0)]">
      <div className="absolute inset-0 overflow-hidden">
        <GymAnimatedBg variant="register" />
      </div>

      <div className="absolute top-5 left-5 hidden lg:flex items-center gap-2.5 z-20">
        <div className="flex size-8 items-center justify-center rounded-xl bg-white text-[var(--charge-500)] shadow">
          <Dumbbell className="size-4" />
        </div>
        <div>
          <div className="font-display font-bold text-sm leading-none text-white drop-shadow">FitPay</div>
          <div className="text-[10px] tracking-widest uppercase font-semibold text-white/80">Charge and Grow</div>
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-[440px] lg:max-w-[460px] max-h-[min(88vh,620px)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)] shadow-xl border-white/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <CardHeader className="text-center space-y-3 pb-3 pt-5">
          <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-[var(--charge-500)] text-white shadow">
            <Dumbbell className="size-5" />
          </div>
          <div>
            <CardTitle className="font-display text-[19px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">Create account</CardTitle>
            <CardDescription className="text-[12px] text-[var(--ink-600)] mt-1">Step {step} of {STEPS.length} — {STEPS[step-1].label}</CardDescription>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isDone = step > s.id
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] font-bold transition-all ${isDone ? "bg-[var(--charge-500)] border-[var(--charge-500)] text-white" : isActive ? "bg-[var(--charge-500)] border-[var(--charge-500)] text-white" : "bg-white border-[var(--ink-300)] text-[var(--ink-600)]"}`}>
                        {isDone ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                      </div>
                      <span className={`hidden sm:block text-[11px] font-semibold tracking-wide leading-none ${isActive ? "text-[var(--ink-900)]" : isDone ? "text-[var(--charge-500)]" : "text-[var(--ink-600)]"}`}>{s.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors ${step > s.id ? "bg-[var(--charge-500)]" : "bg-[var(--ink-300)]"}`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-2.5 flex gap-1">
              {STEPS.map((s) => (
                <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${step >= s.id ? "bg-[var(--charge-500)]" : "bg-[var(--ink-300)]/60"}`} />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 pb-5">
          {error && (
            <div className="flex gap-2 rounded-lg border border-[#FCE8E8] bg-[#FBE2E2] px-3 py-2 text-[13px] leading-snug text-[#C43D3D]">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                  <User className="size-3" /> Account details
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-[13px] font-medium text-[var(--ink-900)]">Full name <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" required autoFocus className="h-11 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px]" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[13px] font-medium text-[var(--ink-900)]">Email <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@fitpay.test" required autoComplete="email" className="h-11 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px]" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--ink-600)]">
                  <Phone className="size-3" /> Member information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-[13px] font-medium">Phone <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 6789" required autoFocus className="h-11 rounded-lg text-[14px]" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="birthdate" className="text-[13px] font-medium flex items-center gap-1">Birthdate <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="birthdate" type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} required className="h-11 rounded-lg text-[14px]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[13px] font-medium">Gender <span className="text-[#C43D3D]">*</span></Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="h-11 w-full rounded-lg text-[14px]"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-[13px] font-medium flex items-center gap-1">Address <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" required className="h-11 rounded-lg text-[14px]" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                  <Lock className="size-3" /> Secure your account
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[13px] font-medium text-[var(--ink-900)]">Password <span className="text-[#C43D3D]">*</span></Label>
                    <div className="relative">
                      <Input id="password" type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required autoFocus className="h-11 rounded-lg border-[var(--ink-300)] bg-white pr-9 focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px]" />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[var(--ink-600)] hover:bg-zinc-100 transition-colors">
                        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--ink-600)]">Min. 8 characters</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password_confirmation" className="text-[13px] font-medium text-[var(--ink-900)]">Confirm password <span className="text-[#C43D3D]">*</span></Label>
                    <Input id="password_confirmation" type={show ? "text" : "password"} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} placeholder="••••••••" required className="h-11 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px]" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-1">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="h-11 w-32 rounded-lg border-[var(--ink-300)] bg-white hover:bg-zinc-50 text-[14px] font-medium">
                  <ArrowLeft className="size-3.5" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext} className="h-11 w-32 rounded-lg bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[14px] shadow-sm">
                  Continue <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="h-11 w-32 rounded-lg bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[14px] shadow-sm">
                  {loading ? <><Loader2 className="size-3.5 animate-spin" /> Creating…</> : "Create account"}
                </Button>
              )}
            </div>
          </form>

          <p className="text-center text-[13px] text-[var(--ink-600)]">
            Already have an account? <Link to="/login" className="font-semibold text-[var(--charge-500)] hover:text-[var(--charge-600)] hover:underline underline-offset-4">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
