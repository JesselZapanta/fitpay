import { useEffect, useState, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, User, Check, ArrowLeft, ArrowRight, Search, X, DollarSign, Upload, AlertCircle, ShieldCheck } from "lucide-react"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"
import { toast } from "sonner"

const STEPS = [
  { id: 1, label: "User", icon: User },
  { id: 2, label: "Membership", icon: ShieldCheck },
  { id: 3, label: "Payment", icon: CreditCard },
]

const planOptions = [
  { value: "daily", label: "Daily Pass", amount: 25 },
  { value: "monthly", label: "Monthly Plan", amount: 300 },
  { value: "yearly", label: "Yearly Plan", amount: 2000 },
]

export default function AdminPaymentCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [userSearch, setUserSearch] = useState("")
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [form, setForm] = useState({
    plan_type: "monthly",
    amount: "300",
    reference_number: "",
  })
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)

  const fetchUsers = useCallback(async (search = "") => {
    setUsersLoading(true)
    try {
      const { data } = await api.get("/members", { params: { search: search || undefined, per_page: 10 } })
      const list = data.data || []
      setUsers(list)
    } catch {
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers("")
  }, [fetchUsers])

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(userSearch), 400)
    return () => clearTimeout(t)
  }, [userSearch, fetchUsers])

  const handleSelectUser = (member) => {
    setSelectedUser(member)
    setError("")
  }

  const handlePlanChange = (value) => {
    const opt = planOptions.find(p => p.value === value)
    setForm(s => ({ ...s, plan_type: value, amount: opt ? String(opt.amount) : s.amount }))
  }

  const validateStep = (s) => {
    if (s === 1) {
      if (!selectedUser) return "Please select a user."
      return null
    }
    if (s === 2) {
      if (!form.plan_type) return "Plan type is required."
      return null
    }
    if (s === 3) {
      if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return "Valid amount is required."
      if (!form.reference_number.trim()) return "Reference number is required."
      return null
    }
    return null
  }

  const handleNext = () => {
    const msg = validateStep(step)
    if (msg) { setError(msg); return }
    setError("")
    setStep(v => Math.min(3, v + 1))
  }

  const handleBack = () => {
    setError("")
    setStep(v => Math.max(1, v - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step !== 3) { handleNext(); return }
    const m1 = validateStep(1) || validateStep(2) || validateStep(3)
    if (m1) {
      setError(m1)
      if (validateStep(1)) setStep(1)
      else if (validateStep(2)) setStep(2)
      else setStep(3)
      return
    }
    setError("")
    setLoading(true)
    try {
      const fd = new FormData()
      const userId = selectedUser.user_id || selectedUser.user?.id
      fd.append("user_id", String(userId))
      fd.append("plan_type", form.plan_type)
      fd.append("amount", String(form.amount))
      fd.append("reference_number", form.reference_number.trim())
      if (receiptFile) fd.append("receipt", receiptFile)

      await api.post("/payments", fd, { headers: { "Content-Type": "multipart/form-data" } })
      toast.success("Payment created — membership & request approved")
      navigate("/admin/payments")
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create payment."
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]?.[0] || msg
        setError(first)
      } else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onReceiptChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Receipt must be under 5MB.")
      return
    }
    setReceiptFile(file)
    if (file) setReceiptPreview(URL.createObjectURL(file))
    else setReceiptPreview(null)
  }

  return (
    <AdminLayout title="Add Payment">
      <div className="space-y-4 sm:space-y-6 max-w-[720px] mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/payments")} className="gap-1.5 -ml-1 w-fit">
          <ArrowLeft className="size-4" /> Back to payments
        </Button>

        <Card className="border-[var(--ink-300)] shadow-lg overflow-hidden max-h-[min(88vh,720px)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)]">
          <CardHeader className="text-center space-y-3 pb-4 bg-white sticky top-0 z-10 border-b border-[var(--ink-300)]/60">
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
                {STEPS.map(s => (
                  <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${step >= s.id ? "bg-[var(--charge-500)]" : "bg-[var(--ink-300)]/60"}`} />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="flex gap-2 rounded-lg border border-[#FCE8E8] bg-[#FBE2E2] px-3 py-2 text-[13px] leading-snug text-[#C43D3D]">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                    <User className="size-3" /> Select User
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">Search member <span className="text-[#C43D3D]">*</span></Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                      <Input placeholder="Search name, email, code, phone…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9 h-11 text-[14px]" />
                      {userSearch && (
                        <button type="button" onClick={() => setUserSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] cursor-pointer">
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--ink-300)] bg-white max-h-[260px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full">
                    {usersLoading ? (
                      <div className="p-3 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                      </div>
                    ) : users.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[var(--ink-600)]">No members found. Try search.</div>
                    ) : (
                      <div className="divide-y divide-[var(--ink-300)]/60">
                        {users.map((m) => {
                          const isSelected = selectedUser && (selectedUser.id === m.id || selectedUser.user_id === m.user_id)
                          const userId = m.user_id || m.user?.id
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectUser(m)}
                              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--surface-0)] transition-colors cursor-pointer ${isSelected ? "bg-[var(--charge-100)]/70" : ""}`}
                            >
                              <span className={`size-8 rounded-full inline-flex items-center justify-center shrink-0 border ${isSelected ? "bg-[var(--charge-500)] text-white border-[var(--charge-500)]" : "bg-[var(--surface-0)] text-[var(--ink-600)] border-[var(--ink-300)]"}`}>
                                <User className="size-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold truncate text-[var(--ink-900)]">{m.name || m.user?.name || "—"}</span>
                                <span className="block text-xs text-[var(--ink-600)] truncate">{m.email || m.user?.email || "—"} · {m.member_code}</span>
                                <span className="block text-[11px] font-mono text-[var(--ink-600)]">user #{userId} · member #{m.id}</span>
                              </span>
                              {isSelected && <Check className="size-4 text-[var(--charge-500)] shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="rounded-xl border border-[var(--charge-500)]/20 bg-[var(--charge-100)]/50 p-3 flex items-center gap-3">
                      <span className="size-8 rounded-full bg-[var(--charge-500)] text-white inline-flex items-center justify-center shrink-0"><Check className="size-4" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--ink-900)]">Selected: {selectedUser.name || selectedUser.user?.name}</span>
                        <span className="block text-xs text-[var(--ink-600)]">user #{selectedUser.user_id || selectedUser.user?.id} · {selectedUser.member_code}</span>
                      </span>
                      <Badge className="ml-auto rounded-full bg-[var(--charge-500)] text-white border-0 text-[10px]">User</Badge>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--ink-600)]">
                    <ShieldCheck className="size-3" /> Membership
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[13px] font-medium">Plan type <span className="text-[#C43D3D]">*</span></Label>
                    <Select value={form.plan_type} onValueChange={handlePlanChange}>
                      <SelectTrigger className="h-11 w-full rounded-lg text-[14px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Pass — ₱25</SelectItem>
                        <SelectItem value="monthly">Monthly Plan — ₱300</SelectItem>
                        <SelectItem value="yearly">Yearly Plan — ₱2,000</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-[var(--ink-600)]">New membership and approved request will be created for this plan.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                    <DollarSign className="size-3" /> Payment
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="amount" className="text-[13px] font-medium">Amount <span className="text-[#C43D3D]">*</span></Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-600)]" />
                        <Input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm(s => ({ ...s, amount: e.target.value }))} placeholder="300.00" className="h-11 pl-9 rounded-lg text-[14px]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reference" className="text-[13px] font-medium">Reference number <span className="text-[#C43D3D]">*</span></Label>
                      <Input id="reference" value={form.reference_number} onChange={(e) => setForm(s => ({ ...s, reference_number: e.target.value }))} placeholder="GCash-123456" className="h-11 rounded-lg text-[14px]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[13px] font-medium flex items-center gap-1.5"><Upload className="size-3.5 text-[var(--ink-600)]" /> Receipt <span className="text-xs font-normal text-[var(--ink-600)]">(optional)</span></Label>
                    <Input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={onReceiptChange} className="h-11 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-[var(--ink-300)] file:bg-[var(--surface-0)] file:text-xs file:font-medium cursor-pointer text-xs" />
                    {receiptPreview && <img src={receiptPreview} alt="receipt" className="w-full max-h-32 object-contain rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] mt-2" />}
                    <p className="text-[11px] text-[var(--ink-600)]">If no receipt, admin placeholder will be used. Approved by default.</p>
                  </div>

                  <div className="rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 space-y-1">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Summary</div>
                    <div className="text-sm"><span className="text-[var(--ink-600)]">User:</span> <span className="font-semibold">{selectedUser?.name || selectedUser?.user?.name} · user #{selectedUser?.user_id || selectedUser?.user?.id}</span></div>
                    <div className="text-sm"><span className="text-[var(--ink-600)]">Membership:</span> <span className="font-semibold">New {form.plan_type} → membership (active) + request (approved)</span></div>
                    <div className="text-sm"><span className="text-[var(--ink-600)]">Payment:</span> <span className="font-semibold">₱{Number(form.amount || 0).toLocaleString()} · {form.reference_number || "—"}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
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
                    {loading ? <><Loader2 className="size-3.5 animate-spin" /> Creating…</> : "Create payment"}
                  </Button>
                )}
              </div>
            </form>

            <p className="text-center text-[13px] text-[var(--ink-600)]">
              <Link to="/admin/payments" className="font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)]">← Back to payments</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
