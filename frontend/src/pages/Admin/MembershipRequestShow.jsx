import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Receipt, CheckCircle2, XCircle, Clock, User, Mail, Phone, MapPin, CalendarDays, BadgeCheck, Loader2, ShieldCheck } from "lucide-react"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"
import { toast } from "sonner"

const planLabels = { daily: "Daily Pass", monthly: "Monthly Plan", yearly: "Yearly Plan" }
const planColors = { daily: "#0D9488", monthly: "#7C3AED", yearly: "#D97706" }

function StatusBadge({ status }) {
  const map = {
    pending: "bg-[#FEF3C7] text-[#B8790A] border-[#B8790A]/20",
    approved: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    rejected: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
  }
  const icons = { pending: Clock, approved: CheckCircle2, rejected: XCircle }
  const Icon = icons[status] || Clock
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border gap-1 ${map[status] || map.pending}`}>
      <Icon className="size-3" /> {status}
    </Badge>
  )
}

function resolvePhotoUrl(src) {
  if (!src) return null
  if (src.startsWith("blob:") || src.startsWith("http") || src.startsWith("data:")) return src
  if (src.startsWith("/storage/")) {
    const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000"
    return base + src
  }
  return src
}

export default function MembershipRequestShow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState("")
  const [actionOpen, setActionOpen] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [noteError, setNoteError] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/membership-requests/${id}`)
      setData(res.data)
    } catch {
      toast.error("Failed to load request")
      navigate("/admin/membership-requests", { replace: true })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [id])

  const handleAction = async () => {
    if (actionType === "rejected" && !adminNote.trim()) {
      setNoteError("Admin note is required when rejecting.")
      return
    }
    setNoteError("")
    setSaving(true)
    try {
      await api.put(`/membership-requests/${id}`, { status: actionType, admin_note: adminNote })
      toast.success(`Request ${actionType}`)
      setActionOpen(false)
      fetchData()
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors?.admin_note) {
        setNoteError(err.response.data.errors.admin_note[0])
      } else {
        toast.error(err.response?.data?.message || "Failed to update")
      }
    } finally { setSaving(false) }
  }

  const openAction = (type) => {
    if (type === "rejected" && !adminNote.trim()) {
      setNoteError("Admin note is required when rejecting.")
      toast.error("Please add a reason for rejection.")
      return
    }
    setNoteError("")
    setActionType(type)
    setActionOpen(true)
  }

  if (loading) {
    return (
      <AdminLayout title="Request Details">
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) return null

  const photoUrl = resolvePhotoUrl(data.user?.photo_url || data.user?.photo || data.member?.photo_url)
  const initials = (data.user?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const receiptUrl = resolvePhotoUrl(data.receipt_url)

  return (
    <AdminLayout title="Request Details">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-9 cursor-pointer shrink-0" onClick={() => navigate("/admin/membership-requests")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[20px] sm:text-[22px] font-semibold text-[var(--ink-900)] flex items-center gap-2 flex-wrap">
              <Receipt className="size-5 text-[var(--charge-500)]" /> Request #{data.id}
              <StatusBadge status={data.status} />
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-600)]">
              {planLabels[data.plan_type] || data.plan_type} · ₱{Number(data.amount).toLocaleString()} · {new Date(data.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr] items-start">
          <div className="space-y-4">
            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <User className="size-4 text-[var(--charge-500)]" /> Member Information
                </CardTitle>
                <CardDescription className="text-xs">User and membership profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="size-24 border-2 border-white shadow-md">
                    {photoUrl ? <AvatarImage src={photoUrl} alt={data.user?.name} className="object-cover" /> : null}
                    <AvatarFallback className="text-lg font-bold bg-[var(--charge-100)] text-[var(--charge-500)]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[var(--ink-900)]">{data.user?.name || "—"}</div>
                    <div className="text-xs text-[var(--ink-600)] flex items-center justify-center gap-1">
                      <Mail className="size-3" /> {data.user?.email || "—"}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                      <Badge className="rounded-full text-[10px] px-2.5 py-0.5 font-bold uppercase bg-[var(--charge-500)] text-white border-0">
                        <ShieldCheck className="size-3 mr-1" /> {data.user?.role || "member"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Member code</div>
                    <div className="mt-1 text-sm font-semibold font-mono text-[var(--ink-900)]">{data.member?.member_code || "—"}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Member status</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={`rounded-full text-[10px] ${data.member?.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20"}`}>
                        {data.member?.status || "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="size-3.5 text-[var(--ink-600)]" /> <span className="font-medium">{data.member?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarDays className="size-3.5 text-[var(--ink-600)]" /> <span className="font-medium">{data.member?.birthdate ? new Date(data.member.birthdate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <User className="size-3.5 text-[var(--ink-600)]" /> <span className="font-medium capitalize">{data.member?.gender || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="size-3.5 text-[var(--ink-600)] mt-0.5" /> <span className="font-medium">{data.member?.address || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-[var(--ink-300)] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Receipt className="size-4 text-[var(--charge-500)]" /> Payment Details
                </CardTitle>
                <CardDescription className="text-xs">Review the payment before approving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Plan</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--ink-900)] flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: planColors[data.plan_type] || "var(--charge-500)" }} />
                      {planLabels[data.plan_type] || data.plan_type}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Amount</div>
                    <div className="mt-1 text-lg font-bold text-[var(--ink-900)]">₱{Number(data.amount).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Status</div>
                    <div className="mt-1"><StatusBadge status={data.status} /></div>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Reference Number</div>
                  <div className="mt-1 font-mono text-sm text-[var(--ink-900)]">{data.reference_number}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <BadgeCheck className="size-3.5 text-[var(--ink-600)]" /> Receipt Image
                  </Label>
                  {receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-[var(--ink-300)] overflow-hidden bg-white hover:opacity-90 transition-opacity">
                      <img src={receiptUrl} alt="Receipt" className="w-full max-h-[420px] object-contain" />
                    </a>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--ink-300)] p-8 text-center text-xs text-[var(--ink-600)]">No receipt uploaded</div>
                  )}
                  {receiptUrl && <p className="text-[11px] text-[var(--ink-600)]">Click image to open full size in new tab.</p>}
                </div>

                {data.admin_note && (
                  <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Admin Note</div>
                    <div className="mt-1 text-sm text-[var(--ink-900)] whitespace-pre-wrap">{data.admin_note}</div>
                  </div>
                )}

                {data.status === "pending" ? (
                  <div className="border-t border-[var(--ink-300)] pt-4 space-y-3">
                    <Label className="text-xs font-medium">
                      Admin Note <span className="font-normal text-[var(--ink-600)]">(required when rejecting)</span>
                    </Label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => { setAdminNote(e.target.value); if (noteError) setNoteError("") }}
                      placeholder="Add a note — required if rejecting…"
                      className={`min-h-[80px] text-sm ${noteError ? "border-[#C43D3D]" : ""}`}
                    />
                    {noteError && <p className="text-[11px] text-[#C43D3D]">{noteError}</p>}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 min-h-11 cursor-pointer gap-1.5 text-[#C43D3D] border-[#C43D3D]/30 hover:bg-[#FBE2E2]" onClick={() => openAction("rejected")}>
                        <XCircle className="size-4" /> Reject
                      </Button>
                      <Button className="flex-1 min-h-11 cursor-pointer gap-1.5 bg-[#1E8E5A] hover:bg-[#167347] text-white" onClick={() => openAction("approved")}>
                        <CheckCircle2 className="size-4" /> Approve
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-3 text-xs text-center" style={{ background: data.status === "approved" ? "#DFF5E9" : "#FBE2E2", borderColor: data.status === "approved" ? "#1E8E5A20" : "#C43D3D20", color: data.status === "approved" ? "#1E8E5A" : "#C43D3D" }}>
                    This request has been <span className="font-bold">{data.status}</span> {data.admin_note ? `— ${data.admin_note}` : ""}.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-[380px] max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--ink-300)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--ink-300)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--ink-600)]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {actionType === "approved" ? <CheckCircle2 className="size-5 text-[#1E8E5A]" /> : <XCircle className="size-5 text-[#C43D3D]" />}
              {actionType === "approved" ? "Approve" : "Reject"} Request?
            </DialogTitle>
            <DialogDescription className="text-xs">
              {data.user?.name} — {planLabels[data.plan_type] || data.plan_type} · ₱{Number(data.amount).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {adminNote && (
            <div className="rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Note to member</div>
              <div className="mt-1 text-xs text-[var(--ink-900)] whitespace-pre-wrap">{adminNote}</div>
            </div>
          )}
          {noteError && <p className="text-[11px] text-[#C43D3D]">{noteError}</p>}
          <DialogFooter className="gap-3">
            <Button variant="outline" className="cursor-pointer" onClick={() => setActionOpen(false)}>Cancel</Button>
            <Button
              className={`cursor-pointer gap-1.5 text-white ${actionType === "approved" ? "bg-[#1E8E5A] hover:bg-[#167347]" : "bg-[#C43D3D] hover:bg-[#A33232]"}`}
              disabled={saving}
              onClick={handleAction}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : actionType === "approved" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {saving ? "Saving..." : actionType === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
