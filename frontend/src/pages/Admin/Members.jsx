import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Users, Filter, X, Image as ImageIcon, Mail, Phone, MapPin, Calendar, UserRound, Upload, Trash, User, Lock, Check, ArrowLeft, ArrowRight } from "lucide-react"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"
import { toast } from "sonner"

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
]

function StatusBadge({ status }) {
  const map = {
    active: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    inactive: "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20",
    expired: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
  }
  return <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${map[status] || map.inactive}`}>{status}</Badge>
}

function resolvePhotoUrl(photo, photoUrl) {
  const src = photoUrl || photo
  if (!src) return null
  if (src.startsWith("blob:") || src.startsWith("http") || src.startsWith("data:")) return src
  if (src.startsWith("/storage/")) {
    const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000"
    return base + src
  }
  return src
}

function Avatar({ photo, photoUrl, name, size = "sm" }) {
  const src = resolvePhotoUrl(photo, photoUrl)
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const dim = size === "lg" ? "size-14 text-sm" : size === "md" ? "size-9 text-xs" : "size-8 text-[11px]"
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover border border-[var(--ink-300)] bg-white shrink-0`} onError={(e) => { e.currentTarget.style.display = "none" }} />
  }
  return (
    <div className={`${dim} rounded-full bg-[var(--charge-100)] border border-[var(--charge-500)]/15 text-[var(--charge-500)] font-bold inline-flex items-center justify-center shrink-0`}>
      {initials || <UserRound className="size-4" />}
    </div>
  )
}

function MemberForm({ open, onOpenChange, onSubmit, initial, loading }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address: "",
    birthdate: "",
    gender: "",
    status: "active",
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)
  const [show, setShow] = useState(false)
  const fileRef = useRef(null)

  const STEPS = [
    { id: 1, label: "Account", icon: User },
    { id: 2, label: "Member", icon: Phone },
    { id: 3, label: "Security", icon: Lock },
  ]

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        email: initial.email || "",
        password: "",
        password_confirmation: "",
        phone: initial.phone || "",
        address: initial.address || "",
        birthdate: initial.birthdate || "",
        gender: initial.gender || "",
        status: initial.status || "active",
      })
      setPhotoFile(null)
      setPhotoPreview(resolvePhotoUrl(initial.photo, initial.photo_url) || null)
    } else {
      setForm({ name: "", email: "", password: "", password_confirmation: "", phone: "", address: "", birthdate: "", gender: "", status: "active" })
      setPhotoFile(null)
      setPhotoPreview(null)
    }
    setErrors({})
    setStep(1)
    setShow(false)
    if (fileRef.current) fileRef.current.value = ""
  }, [initial, open])

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: ["Photo must be under 5MB."] }))
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase()
      const isImageType = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext)
      if (!isImageType) {
        setErrors((prev) => ({ ...prev, photo: ["Photo must be JPG, PNG, or WebP."] }))
        if (fileRef.current) fileRef.current.value = ""
        return
      }
    }
    setErrors((prev) => ({ ...prev, photo: undefined }))
    setPhotoFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    } else {
      setPhotoPreview(initial ? resolvePhotoUrl(initial.photo, initial.photo_url) || null : null)
    }
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.name.trim()) return "Full name is required."
      return null
    }
    if (s === 3) {
      if (!initial) {
        if (!form.password) return "Password is required."
        if (form.password.length < 8) return "Password must be at least 8 characters."
        if (form.password !== form.password_confirmation) return "Passwords do not match."
      } else if (form.password) {
        if (form.password.length < 8) return "Password must be at least 8 characters."
        if (form.password !== form.password_confirmation) return "Passwords do not match."
      }
      return null
    }
    return null
  }

  const handleNext = () => {
    const msg = validateStep(step)
    if (msg) {
      setErrors((prev) => ({ ...prev, _step: msg }))
      return
    }
    setErrors((prev) => ({ ...prev, _step: undefined }))
    setStep((v) => Math.min(3, v + 1))
  }

  const handleBack = () => {
    setErrors((prev) => ({ ...prev, _step: undefined }))
    setStep((v) => Math.max(1, v - 1))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (step !== 3) {
      handleNext()
      return
    }
    const m1 = validateStep(1)
    if (m1) {
      setErrors((prev) => ({ ...prev, _step: m1 }))
      setStep(1)
      return
    }
    const m3 = validateStep(3)
    if (m3) {
      setErrors((prev) => ({ ...prev, _step: m3 }))
      setStep(3)
      return
    }
    setErrors({})
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      if (form.email) fd.append("email", form.email)
      if (form.password) {
        fd.append("password", form.password)
        fd.append("password_confirmation", form.password_confirmation)
      }
      if (form.phone) fd.append("phone", form.phone)
      if (form.address) fd.append("address", form.address)
      if (form.birthdate) fd.append("birthdate", form.birthdate)
      if (form.gender) fd.append("gender", form.gender)
      fd.append("status", form.status)
      if (photoFile) fd.append("photo", photoFile)

      await onSubmit(fd)
      onOpenChange(false)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
        const keys = Object.keys(err.response.data.errors || {})
        if (keys.some(k => ["name","email","password"].includes(k))) setStep(1)
        else if (keys.some(k => ["phone","address"].includes(k))) setStep(2)
        else setStep(3)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)] bg-white p-0 gap-0">
        <div className="sticky top-0 z-10 bg-white border-b border-[var(--ink-300)] px-4 sm:px-6 py-4">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-[var(--charge-500)] text-white shadow">
              <Users className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-[19px] font-semibold tracking-tight text-[var(--ink-900)] leading-none text-center">{initial ? "Edit member" : "Add member"}</DialogTitle>
              <DialogDescription className="text-[12px] text-[var(--ink-600)] mt-1 text-center">Step {step} of {STEPS.length} — {STEPS[step-1].label}</DialogDescription>
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
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="px-4 sm:px-6 py-4 space-y-4">
          {errors._step && (
            <div className="flex gap-2 rounded-lg border border-[#FCE8E8] bg-[#FBE2E2] px-3 py-2 text-[13px] leading-snug text-[#C43D3D]">
              <X className="size-3.5 shrink-0 mt-0.5" />
              <span>{errors._step}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                <User className="size-3" /> Account
              </div>
              <div className="flex gap-4 items-start">
                <Avatar photo={photoPreview} name={form.name} size="lg" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Label htmlFor="photo" className="text-[13px] font-medium flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-[var(--ink-600)]" /> Photo
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileRef}
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={onFileChange}
                      className={`h-11 flex-1 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-[var(--ink-300)] file:bg-[var(--surface-0)] file:text-xs file:font-medium hover:file:bg-white cursor-pointer ${errors.photo ? "border-[#C43D3D]" : ""}`}
                    />
                    {photoPreview && (
                      <Button type="button" variant="outline" size="icon" className="size-11 shrink-0 cursor-pointer" onClick={clearPhoto} aria-label="Remove photo">
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                  {errors.photo && <p className="text-[11px] text-[#C43D3D]">{errors.photo[0]}</p>}
                  <p className="text-[11px] text-[var(--ink-600)] flex items-center gap-1 leading-tight">
                    <Upload className="size-3 shrink-0" /> Upload JPG/PNG/WebP, max 5MB.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-[13px] font-medium text-[var(--ink-900)]">
                    Full name <span className="text-[#C43D3D]">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className={`h-11 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px] ${errors.name ? "border-[#C43D3D]" : ""}`}
                  />
                  {errors.name && <p className="text-[11px] text-[#C43D3D]">{errors.name[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[13px] font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="juan@example.com"
                      className={`h-11 pl-9 rounded-lg text-[14px] ${errors.email ? "border-[#C43D3D]" : ""}`}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-[11px] text-[#C43D3D]">{errors.email[0]}</p>
                  ) : (
                    <p className="text-[11px] text-[var(--ink-600)]">Unique per user. Leave blank to auto-generate @fitpay.local.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--ink-600)]">
                <Phone className="size-3" /> Member
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[13px] font-medium flex items-center gap-1.5">
                    <Phone className="size-3.5 text-[var(--ink-600)]" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="0912 345 6789"
                    className={`h-11 rounded-lg text-[14px] ${errors.phone ? "border-[#C43D3D]" : ""}`}
                  />
                  {errors.phone && <p className="text-[11px] text-[#C43D3D]">{errors.phone[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address" className="text-[13px] font-medium flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[var(--ink-600)]" /> Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Main St, Barangay, City"
                    className={`h-11 rounded-lg text-[14px] ${errors.address ? "border-[#C43D3D]" : ""}`}
                  />
                  {errors.address && <p className="text-[11px] text-[#C43D3D]">{errors.address[0]}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="space-y-1 min-w-0">
                  <Label htmlFor="birthdate" className="text-[13px] font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-[var(--ink-600)]" /> Birthdate
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => handleChange("birthdate", e.target.value)}
                    className={`h-11 w-full min-w-0 rounded-lg text-[14px] ${errors.birthdate ? "border-[#C43D3D]" : ""}`}
                  />
                  {errors.birthdate && <p className="text-[11px] text-[#C43D3D]">{errors.birthdate[0]}</p>}
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="text-[13px] font-medium">Gender</Label>
                  <Select value={form.gender || "none"} onValueChange={(v) => handleChange("gender", v === "none" ? "" : v)}>
                    <SelectTrigger className="h-11 w-full rounded-lg text-[14px]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-[11px] text-[#C43D3D]">{errors.gender[0]}</p>}
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="text-[13px] font-medium">Status</Label>
                  <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="h-11 w-full rounded-lg text-[14px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-[11px] text-[#C43D3D]">{errors.status[0]}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                <Lock className="size-3" /> Security
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[13px] font-medium text-[var(--ink-900)] flex items-center gap-1.5">
                    <Lock className="size-3.5 text-[var(--ink-600)]" /> Password {!initial && <span className="text-[#C43D3D]">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••"
                      className={`h-11 rounded-lg border-[var(--ink-300)] bg-white pr-9 focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px] ${errors.password ? "border-[#C43D3D]" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[var(--ink-600)] hover:bg-zinc-100 transition-colors"
                    >
                      {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-[11px] text-[#C43D3D]">{errors.password[0]}</p>
                  ) : (
                    <p className="text-[11px] text-[var(--ink-600)]">{initial ? "Leave blank to keep current" : "Min. 8 characters"}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password_confirmation" className="text-[13px] font-medium text-[var(--ink-900)]">
                    Confirm {!initial && <span className="text-[#C43D3D]">*</span>}
                  </Label>
                  <Input
                    id="password_confirmation"
                    type={show ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(e) => handleChange("password_confirmation", e.target.value)}
                    placeholder="••••••••"
                    className={`h-11 rounded-lg border-[var(--ink-300)] bg-white focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20 text-[14px] ${errors.password_confirmation ? "border-[#C43D3D]" : ""}`}
                  />
                  {errors.password_confirmation && <p className="text-[11px] text-[#C43D3D]">{errors.password_confirmation[0]}</p>}
                </div>
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
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-32 rounded-lg bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[14px] shadow-sm"
              >
                {loading ? "Saving..." : initial ? "Update member" : "Create member"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


export default function MembersIndex() {
  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1, from: 0, to: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const perPage = 10
  const [sortBy] = useState("created_at")
  const [sortDir] = useState("desc")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/members", {
        params: {
          search: debouncedSearch || undefined,
          status: status !== "all" ? status : undefined,
          page,
          per_page: perPage,
          sort_by: sortBy,
          sort_dir: sortDir,
        },
      })
      setMembers(data.data || [])
      setMeta(data.meta || { current_page: 1, per_page: perPage, total: 0, last_page: 1, from: 0, to: 0 })
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page, sortBy, sortDir])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleCreate = async (formData) => {
    setSaving(true)
    try {
      await api.post("/members", formData)
      toast.success("Member created successfully.", { description: formData.get("name") || undefined })
      await fetchMembers()
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create member."
      toast.error(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (formData) => {
    if (!selected) return
    setSaving(true)
    try {
      formData.append("_method", "PUT")
      await api.post(`/members/${selected.id}`, formData)
      toast.success("Member updated successfully.")
      await fetchMembers()
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update member."
      toast.error(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.delete(`/members/${selected.id}`)
      toast.success("Member deleted.", { description: selected.name })
      setDeleteOpen(false)
      setSelected(null)
      await fetchMembers()
    } catch {
      toast.error("Failed to delete member.")
    } finally {
      setSaving(false)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setStatus("all")
    setPage(1)
  }

  const hasFilters = search || status !== "all"

  return (
    <AdminLayout title="Members">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">
                  Members
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)]">
                  <span className="font-semibold text-[var(--charge-500)]">{meta.total}</span> total — admin workspace
                </p>
              </div>
              <Button
                onClick={() => { setSelected(null); setCreateOpen(true) }}
                className="gap-2 min-h-11 cursor-pointer bg-[var(--charge-500)] hover:bg-[var(--charge-600)] w-full sm:w-auto shrink-0"
              >
                <Plus className="size-4" /> Add member
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-300)] shadow-sm">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                <Input
                  placeholder="Search code, name, email, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 pr-9 text-sm"
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-[var(--ink-600)] hidden sm:block shrink-0" />
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full sm:w-[150px] h-11 cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="h-11 cursor-pointer whitespace-nowrap shrink-0">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-600)]">
              <span className="leading-relaxed">
                {meta.total > 0 ? (
                  <>
                    Showing <span className="font-semibold text-[var(--ink-900)]">{meta.from}–{meta.to}</span> of <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span>
                  </>
                ) : "No results"}
                {debouncedSearch && <> for <span className="font-medium text-[var(--ink-900)]">“{debouncedSearch}”</span></>}
                {status !== "all" && <> · <span className="capitalize">{status}</span></>}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of {meta.last_page}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--ink-300)] bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-[var(--surface-0)]">
              <TableRow className="hover:bg-[var(--surface-0)]">
                <TableHead className="font-semibold whitespace-nowrap">Code</TableHead>
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: perPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><div className="flex gap-3 items-center"><Skeleton className="size-8 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3 text-[var(--ink-600)] max-w-sm mx-auto">
                      <div className="size-12 rounded-2xl bg-[var(--surface-0)] border border-[var(--ink-300)] inline-flex items-center justify-center">
                        <Users className="size-6 opacity-40" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--ink-900)]">No members found</p>
                      <p className="text-xs leading-relaxed">Try adjusting search or filters.</p>
                      {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1 cursor-pointer">Clear filters</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id} className="hover:bg-[var(--surface-0)]/60">
                    <TableCell className="font-mono text-xs font-medium whitespace-nowrap">{m.member_code}</TableCell>
                    <TableCell>
                      <div className="flex gap-3 items-center min-w-0">
                        <Avatar photo={m.photo} photoUrl={m.photo_url} name={m.name} size="md" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm leading-tight truncate">{m.name || "—"}</div>
                          <div className="text-xs text-[var(--ink-600)] flex items-center gap-1 truncate">
                            <Calendar className="size-3 shrink-0" /> {m.birthdate || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs flex items-center gap-1.5 truncate max-w-[220px]">
                        <Mail className="size-3 text-[var(--ink-600)] shrink-0" />
                        <span className="truncate">{m.email || "—"}</span>
                      </div>
                      <div className="text-xs text-[var(--ink-600)] flex items-center gap-1.5">
                        <Phone className="size-3 shrink-0" /> {m.phone || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{m.gender || "—"}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => { setSelected(m); setViewOpen(true) }} aria-label="View">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => { setSelected(m); setEditOpen(true) }} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-[#C43D3D] hover:text-[#C43D3D] hover:bg-[#FBE2E2] cursor-pointer"
                          onClick={() => { setSelected(m); setDeleteOpen(true) }}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 sm:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          ) : members.length === 0 ? (
            <Card className="border-dashed p-8 text-center">
              <Users className="size-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">No members</p>
              <p className="text-xs text-[var(--ink-600)] leading-relaxed">No results for current filters.</p>
              {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 cursor-pointer">Clear filters</Button>}
            </Card>
          ) : (
            members.map((m) => (
              <Card key={m.id} className="overflow-hidden border-[var(--ink-300)] shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0 flex-1">
                      <Avatar photo={m.photo} photoUrl={m.photo_url} name={m.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[11px] text-[var(--ink-600)]">{m.member_code}</div>
                        <div className="font-semibold text-sm leading-tight truncate">{m.name || "—"}</div>
                        <div className="text-xs text-[var(--ink-600)] flex items-center gap-1 truncate">
                          <Mail className="size-3 shrink-0" /> <span className="truncate">{m.email || "—"}</span>
                        </div>
                        <div className="text-xs text-[var(--ink-600)] flex items-center gap-1">
                          <Phone className="size-3 shrink-0" /> {m.phone || "—"}
                        </div>
                        <div className="text-xs text-[var(--ink-600)] capitalize flex items-center gap-1">
                          <UserRound className="size-3 shrink-0" /> {m.gender || "—"} {m.birthdate ? `· ${m.birthdate}` : ""}
                        </div>
                        {m.address && (
                          <div className="text-xs text-[var(--ink-600)] flex items-center gap-1 truncate">
                            <MapPin className="size-3 shrink-0" /> <span className="truncate">{m.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-[var(--ink-300)]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-h-11 cursor-pointer gap-1.5"
                      onClick={() => { setSelected(m); setViewOpen(true) }}
                    >
                      <Eye className="size-4" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-h-11 cursor-pointer gap-1.5"
                      onClick={() => { setSelected(m); setEditOpen(true) }}
                    >
                      <Pencil className="size-4" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 px-3 text-[#C43D3D] hover:bg-[#FBE2E2] cursor-pointer"
                      onClick={() => { setSelected(m); setDeleteOpen(true) }}
                      aria-label="Delete member"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--ink-600)] text-center sm:text-left">
            Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of{" "}
            <span className="font-semibold">{meta.last_page}</span> · <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span> total
            {meta.total > 0 && <span className="hidden sm:inline"> · {meta.from}–{meta.to} shown</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="min-h-11 cursor-pointer gap-1.5"
            >
              <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Prev</span><span className="sm:hidden">Prev</span>
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, meta.last_page) }).map((_, i) => {
                let p = i + 1
                if (meta.last_page > 5) {
                  if (meta.current_page <= 3) p = i + 1
                  else if (meta.current_page >= meta.last_page - 2) p = meta.last_page - 4 + i
                  else p = meta.current_page - 2 + i
                }
                return (
                  <Button
                    key={p}
                    variant={meta.current_page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`size-9 p-0 cursor-pointer ${meta.current_page === p ? "bg-[var(--charge-500)] hover:bg-[var(--charge-600)]" : ""}`}
                  >
                    {p}
                  </Button>
                )
              })}
            </div>
            <div className="sm:hidden text-xs font-medium px-2">
              {meta.current_page} / {meta.last_page}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page || loading}
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              className="min-h-11 cursor-pointer gap-1.5"
            >
              <span className="hidden sm:inline">Next</span><span className="sm:hidden">Next</span> <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <MemberForm open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} initial={null} loading={saving} />
      <MemberForm open={editOpen} onOpenChange={setEditOpen} onSubmit={handleUpdate} initial={selected} loading={saving} />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white p-0 gap-0 max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)]">
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[var(--ink-300)]">
            <DialogHeader className="text-left">
              <DialogTitle className="font-display flex items-center gap-3">
                <Avatar photo={selected?.photo} photoUrl={selected?.photo_url} name={selected?.name} size="lg" />
                <span className="min-w-0">
                  <span className="block truncate">{selected?.name || "—"}</span>
                  <span className="block font-mono text-xs font-normal text-[var(--ink-600)]">{selected?.member_code} · <StatusBadge status={selected?.status} /></span>
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">Member details</DialogDescription>
            </DialogHeader>
          </div>

          {selected && (
            <div className="px-5 sm:px-6 py-4 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                    <Mail className="size-3" /> Email
                  </div>
                  <div className="font-medium break-all text-sm">{selected.email || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                    <Phone className="size-3" /> Phone
                  </div>
                  <div className="font-medium text-sm">{selected.phone || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)]">Gender</div>
                  <div className="capitalize text-sm">{selected.gender || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                    <Calendar className="size-3" /> Birthdate
                  </div>
                  <div className="text-sm">{selected.birthdate || "—"}</div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                    <MapPin className="size-3" /> Address
                  </div>
                  <div className="text-sm leading-relaxed break-words">{selected.address || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)]">Member code</div>
                  <div className="font-mono text-sm">{selected.member_code}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)]">User ID</div>
                  <div className="font-mono text-sm">#{selected.user_id}</div>
                </div>
                {(selected.photo || selected.photo_url) ? (
                  <div className="sm:col-span-2 space-y-2">
                    <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                      <ImageIcon className="size-3" /> Photo
                    </div>
                    <img
                      src={resolvePhotoUrl(selected.photo, selected.photo_url)}
                      alt={selected.name}
                      className="w-full max-h-56 object-cover rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)]"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  </div>
                ) : (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--ink-600)] flex items-center gap-1">
                      <ImageIcon className="size-3" /> Photo
                    </div>
                    <div className="text-sm text-[var(--ink-600)]">No photo — showing initials.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-5 sm:px-6 py-4 border-t border-[var(--ink-300)] bg-[var(--surface-0)] flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setViewOpen(false)} className="cursor-pointer min-h-11">
              Close
            </Button>
            <Button
              onClick={() => { setViewOpen(false); setEditOpen(true) }}
              className="cursor-pointer bg-[var(--charge-500)] hover:bg-[var(--charge-600)] min-h-11"
            >
              <Pencil className="size-4 mr-1.5" /> Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#C43D3D]">
              <Trash2 className="size-5" /> Delete member?
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              This will permanently delete <span className="font-semibold text-[var(--ink-900)]">{selected?.name}</span>{" "}
              <span className="font-mono text-xs bg-[var(--surface-0)] border border-[var(--ink-300)] rounded px-1">{selected?.member_code}</span>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving} className="cursor-pointer min-h-11">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="cursor-pointer min-w-[108px] min-h-11">
              {saving ? "Deleting..." : "Delete member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
