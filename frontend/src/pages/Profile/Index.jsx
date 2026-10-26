import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, ShieldCheck, Camera, Lock, Save, Loader2, Eye, EyeOff, Trash2, Image as ImageIcon, Calendar, Phone, MapPin, CalendarDays, BadgeCheck } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import api from "@/lib/api"

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

function ProfileForm({ role }) {
  const { user, fetchUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", email: "" })
  const [profile, setProfile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [originalPhoto, setOriginalPhoto] = useState(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwords, setPasswords] = useState({ current_password: "", password: "", password_confirmation: "" })
  const [memberForm, setMemberForm] = useState({ phone: "", address: "", birthdate: "", gender: "" })
  const [errors, setErrors] = useState({})
  const fileRef = useRef(null)

  const isAdmin = role === "admin"
  const accent = isAdmin ? "var(--charge-500)" : "var(--grow-500)"
  const accentSoft = isAdmin ? "var(--charge-100)" : "var(--grow-100)"
  const accentHover = isAdmin ? "var(--charge-600)" : "#0F766E"

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get("/profile")
      .then(({ data }) => {
        if (!mounted) return
        const p = data.data || data
        setProfile(p)
        setForm({ name: p.name || "", email: p.email || "" })
        if (p.member) {
          setMemberForm({
            phone: p.member.phone || "",
            address: p.member.address || "",
            birthdate: p.member.birthdate || "",
            gender: p.member.gender || "",
          })
        }
        const url = resolvePhotoUrl(p.photo, p.photo_url)
        setOriginalPhoto(url)
        setPhotoPreview(url)
      })
      .catch(() => {
        if (user) {
          setForm({ name: user.name || "", email: user.email || "" })
          const url = resolvePhotoUrl(user.photo, user.photo_url)
          setOriginalPhoto(url)
          setPhotoPreview(url)
        }
        toast.error("Failed to load profile")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(originalPhoto)
      setErrors((p) => ({ ...p, photo: undefined }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: ["Photo must be under 5MB."] }))
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    const ext = file.name.split(".").pop()?.toLowerCase()
    const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext)
    if (!isImage) {
      setErrors((p) => ({ ...p, photo: ["Photo must be JPG, PNG, or WebP."] }))
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    setErrors((p) => ({ ...p, photo: undefined }))
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const clearPhotoSelection = () => {
    setPhotoFile(null)
    setPhotoPreview(originalPhoto)
    if (fileRef.current) fileRef.current.value = ""
    setErrors((p) => ({ ...p, photo: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (!form.name.trim()) {
      setErrors({ name: ["Name is required."] })
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name.trim())
      if (photoFile) fd.append("photo", photoFile)
      if (role === "member") {
        fd.append("phone", memberForm.phone)
        fd.append("address", memberForm.address)
        fd.append("birthdate", memberForm.birthdate)
        fd.append("gender", memberForm.gender)
      }
      if (passwords.password) {
        fd.append("current_password", passwords.current_password)
        fd.append("password", passwords.password)
        fd.append("password_confirmation", passwords.password_confirmation)
      }
      const { data } = await api.post("/profile", fd)
      const updated = data.data
      setProfile(updated)
      setOriginalPhoto(resolvePhotoUrl(updated.photo, updated.photo_url))
      setPhotoPreview(resolvePhotoUrl(updated.photo, updated.photo_url))
      setPhotoFile(null)
      if (fileRef.current) fileRef.current.value = ""
      setPasswords({ current_password: "", password: "", password_confirmation: "" })
      localStorage.setItem("fitpay_user", JSON.stringify(updated))
      await fetchUser()
      toast.success("Profile updated", { description: "Your changes have been saved." })
    } catch (err) {
      if (err.response?.status === 422) {
        const errs = err.response.data.errors || {}
        setErrors(errs)
        const msg = err.response.data.message || "Validation failed."
        toast.error(msg)
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[220px] rounded-xl" />
          <Skeleton className="h-[420px] rounded-xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  const initials = (form.name || profile?.name || user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink-900)] flex items-center gap-2">
          <span className="size-8 rounded-lg inline-flex items-center justify-center border" style={{ background: accentSoft, borderColor: `${accent}20`, color: accent }}>
            <User className="size-4" />
          </span>
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-600)] mt-1">
          Manage your account — email is <span className="font-medium text-[var(--ink-900)]">read-only</span>.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Camera className="size-4" style={{ color: accent }} /> Photo
            </CardTitle>
            <CardDescription className="text-xs">JPG, PNG or WebP — max 5MB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="size-28 sm:size-32 border-2 border-white shadow-md">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt={form.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-lg font-bold" style={{ background: accentSoft, color: accent }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white border border-[var(--ink-300)] shadow-sm inline-flex items-center justify-center" style={{ color: accent }}>
                  <Camera className="size-3.5" />
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-[var(--ink-900)] truncate max-w-[220px]">{form.name || "—"}</div>
                <div className="text-xs text-[var(--ink-600)] flex items-center justify-center gap-1 truncate max-w-[220px]">
                  <Mail className="size-3 shrink-0" /> {form.email}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  <Badge className="rounded-full text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wide border" style={{ background: accent, color: "white", borderColor: accent }}>
                    <ShieldCheck className="size-3 mr-1" /> {profile?.role || user?.role}
                  </Badge>
                  <Badge variant="outline" className={`rounded-full text-[10px] px-2.5 py-0.5 font-semibold ${profile?.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20"}`}>
                    {profile?.status || "active"}
                  </Badge>
                </div>
                {profile?.created_at && (
                  <div className="mt-2 text-[11px] text-[var(--ink-600)] flex items-center justify-center gap-1">
                    <Calendar className="size-3" /> Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="text-xs font-medium flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-[var(--ink-600)]" /> Upload photo
              </Label>
              <div className="flex gap-2">
                <Input
                  ref={fileRef}
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={onPhotoChange}
                  className={`h-11 flex-1 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-[var(--ink-300)] file:bg-[var(--surface-0)] file:text-xs file:font-medium hover:file:bg-white cursor-pointer ${errors.photo ? "border-[#C43D3D]" : ""}`}
                />
                {photoFile && (
                  <Button type="button" variant="outline" size="icon" className="size-10 shrink-0 cursor-pointer" onClick={clearPhotoSelection} aria-label="Clear selection">
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              {errors.photo && <p className="text-[11px] text-[#C43D3D]">{errors.photo[0]}</p>}
              <p className="text-[11px] text-[var(--ink-600)] leading-relaxed">
                Choose a square image for best results. Leave empty to keep current photo.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {profile?.member && (
            <Card className="border-[var(--ink-300)] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <BadgeCheck className="size-4" style={{ color: accent }} /> Member information
                </CardTitle>
                <CardDescription className="text-xs">Your gym membership details — update phone, address and more.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Member code</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--ink-900)] font-mono">{profile.member.member_code || "—"}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Membership status</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`size-2 rounded-full ${profile.member.status === "active" ? "bg-[#1E8E5A]" : profile.member.status === "expired" ? "bg-[#C43D3D]" : "bg-[#5B6168]"}`} />
                      <span className="text-sm font-semibold capitalize text-[var(--ink-900)]">{profile.member.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
                      <Phone className="size-3.5 text-[var(--ink-600)]" /> Phone
                    </Label>
                    <Input
                      id="phone"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="09123456789"
                      className={`h-11 ${errors.phone ? "border-[#C43D3D]" : ""}`}
                    />
                    {errors.phone && <p className="text-[11px] text-[#C43D3D]">{errors.phone[0]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="birthdate" className="text-xs font-medium flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-[var(--ink-600)]" /> Birthdate
                    </Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={memberForm.birthdate}
                      onChange={(e) => setMemberForm((s) => ({ ...s, birthdate: e.target.value }))}
                      className={`h-11 ${errors.birthdate ? "border-[#C43D3D]" : ""}`}
                    />
                    {errors.birthdate && <p className="text-[11px] text-[#C43D3D]">{errors.birthdate[0]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-xs font-medium flex items-center gap-1.5">
                      <User className="size-3.5 text-[var(--ink-600)]" /> Gender
                    </Label>
                    <Select
                      value={memberForm.gender}
                      onValueChange={(val) => setMemberForm((s) => ({ ...s, gender: val }))}
                    >
                      <SelectTrigger className={`h-11 ${errors.gender ? "border-[#C43D3D]" : ""}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-[11px] text-[#C43D3D]">{errors.gender[0]}</p>}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address" className="text-xs font-medium flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[var(--ink-600)]" /> Address
                    </Label>
                    <Input
                      id="address"
                      value={memberForm.address}
                      onChange={(e) => setMemberForm((s) => ({ ...s, address: e.target.value }))}
                      placeholder="Your full address"
                      className={`h-11 ${errors.address ? "border-[#C43D3D]" : ""}`}
                    />
                    {errors.address && <p className="text-[11px] text-[#C43D3D]">{errors.address[0]}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-[var(--ink-300)] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <User className="size-4" style={{ color: accent }} /> Personal information
              </CardTitle>
              <CardDescription className="text-xs">Update your display name. Email cannot be edited.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Full name <span className="text-[#C43D3D]">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Your full name"
                      className={`h-11 ${errors.name ? "border-[#C43D3D]" : ""}`}
                      autoComplete="name"
                    />
                    {errors.name && <p className="text-[11px] text-[#C43D3D]">{errors.name[0]}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                      <Mail className="size-3.5 text-[var(--ink-600)]" /> Email <span className="font-normal text-[var(--ink-600)]">(read-only)</span>
                    </Label>
                    <Input
                      id="email"
                      value={form.email}
                      readOnly
                      disabled
                      className="h-11 bg-[var(--surface-0)] text-[var(--ink-600)] cursor-not-allowed opacity-100 border-[var(--ink-300)]"
                    />
                    <p className="text-[11px] text-[var(--ink-600)]">Email cannot be changed here. Contact support if you need a different email.</p>
                    {errors.email && <p className="text-[11px] text-[#C43D3D]">{errors.email[0]}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Role</div>
                      <div className="mt-1 flex items-center gap-2">
                        <ShieldCheck className="size-4" style={{ color: accent }} />
                        <span className="text-sm font-semibold capitalize text-[var(--ink-900)]">{profile?.role || user?.role}</span>
                      </div>
                      <div className="text-[11px] text-[var(--ink-600)] mt-1">Permissions are managed by admins.</div>
                    </div>
                    <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Status</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`size-2 rounded-full ${profile?.status === "active" ? "bg-[#1E8E5A]" : "bg-[#5B6168]"}`} />
                        <span className="text-sm font-semibold capitalize text-[var(--ink-900)]">{profile?.status || "active"}</span>
                      </div>
                      <div className="text-[11px] text-[var(--ink-600)] mt-1">Active members can check in and pay.</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--ink-300)] pt-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ink-900)] flex items-center gap-2">
                      <Lock className="size-4" style={{ color: accent }} /> Change password
                    </h3>
                    <p className="text-xs text-[var(--ink-600)] mt-1">Leave blank to keep current password. Requires current password when changing.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="current_password" className="text-xs font-medium">Current password</Label>
                      <div className="relative">
                        <Input
                          id="current_password"
                          type={showCurrent ? "text" : "password"}
                          value={passwords.current_password}
                          onChange={(e) => setPasswords((s) => ({ ...s, current_password: e.target.value }))}
                          placeholder="Enter current password"
                          className={`h-11 pr-10 ${errors.current_password ? "border-[#C43D3D]" : ""}`}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 size-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] cursor-pointer text-[var(--ink-600)]"
                          aria-label={showCurrent ? "Hide password" : "Show password"}
                        >
                          {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {errors.current_password && <p className="text-[11px] text-[#C43D3D]">{errors.current_password[0]}</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-medium">New password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showNew ? "text" : "password"}
                            value={passwords.password}
                            onChange={(e) => setPasswords((s) => ({ ...s, password: e.target.value }))}
                            placeholder="Min. 8 characters"
                            className={`h-11 pr-10 ${errors.password ? "border-[#C43D3D]" : ""}`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] cursor-pointer text-[var(--ink-600)]"
                            aria-label={showNew ? "Hide password" : "Show password"}
                          >
                            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[11px] text-[#C43D3D]">{errors.password[0]}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-medium">Confirm new password</Label>
                        <Input
                          id="password_confirmation"
                          type={showNew ? "text" : "password"}
                          value={passwords.password_confirmation}
                          onChange={(e) => setPasswords((s) => ({ ...s, password_confirmation: e.target.value }))}
                          placeholder="Repeat new password"
                          className="h-11"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (profile) {
                        setForm({ name: profile.name || "", email: profile.email || "" })
                        if (profile.member) {
                          setMemberForm({
                            phone: profile.member.phone || "",
                            address: profile.member.address || "",
                            birthdate: profile.member.birthdate || "",
                            gender: profile.member.gender || "",
                          })
                        }
                        setPhotoFile(null)
                        setPhotoPreview(originalPhoto)
                        if (fileRef.current) fileRef.current.value = ""
                      }
                      setPasswords({ current_password: "", password: "", password_confirmation: "" })
                      setErrors({})
                    }}
                    className="min-h-11 cursor-pointer order-2 sm:order-1"
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="min-h-11 cursor-pointer gap-2 order-1 sm:order-2 min-w-[140px] text-white"
                    style={{ background: accent }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = accentHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = accent)}
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--ink-300)] border-t-[var(--charge-500)]" />
      </div>
    )
  }

  const role = user?.role || "member"

  if (role === "admin") {
    return (
      <AdminLayout title="Profile">
        <ProfileForm role="admin" />
      </AdminLayout>
    )
  }

  return (
    <MemberLayout title="Profile">
      <ProfileForm role="member" />
    </MemberLayout>
  )
}
