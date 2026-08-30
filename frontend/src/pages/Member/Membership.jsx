import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import {
  Crown,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Check,
  Sparkles,
  Copy,
  CheckCircle2,
  Upload,
  Loader2,
  X,
  ArrowRight,
  Receipt,
  Clock,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

const plans = [
  {
    id: "daily",
    name: "Daily Pass",
    price: "₱25",
    amount: 25,
    period: "per day",
    icon: Calendar,
    color: "#0D9488",
    gradient: "from-[#0D9488] to-[#14B8A6]",
    bgSoft: "#F0FDFA",
    border: "#0D9488/20",
    description: "Perfect for a quick single-day workout.",
    features: ["Full gym access for 1 day", "All equipment included", "Locker room access", "No commitment needed"],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "₱300",
    amount: 300,
    period: "per month",
    icon: CalendarDays,
    color: "#7C3AED",
    gradient: "from-[#7C3AED] to-[#A78BFA]",
    bgSoft: "#F5F3FF",
    border: "#7C3AED/20",
    description: "Best value for consistent monthly training.",
    features: ["Unlimited gym access", "All equipment included", "Locker room access", "Free group classes", "Progress tracking"],
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: "₱2,000",
    amount: 2000,
    period: "per year",
    icon: CalendarCheck,
    color: "#D97706",
    gradient: "from-[#D97706] to-[#F59E0B]",
    bgSoft: "#FFFBEB",
    border: "#D97706/20",
    description: "Maximum savings for dedicated members.",
    features: [
      "Unlimited access for 12 months",
      "All equipment included",
      "Locker room access",
      "Free group classes",
      "Progress tracking",
      "Priority booking",
      "2 guest passes / month",
    ],
    popular: false,
  },
]

const statusMeta = {
  pending: {
    label: "pending",
    badge: "bg-[#FEF3C7] text-[#B8790A] border-[#F59E0B]/25",
    dot: "bg-[#B8790A]",
    icon: Clock,
    cardBorder: "border-[#F59E0B]/30",
    accent: "bg-[#B8790A]",
    alertBg: "bg-[#FFFBEB]",
    alertBorder: "border-[#FDE68A]",
    alertText: "text-[#92400E]",
    desc: "Waiting for admin approval — you'll be notified once verified.",
  },
  approved: {
    label: "approved",
    badge: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    dot: "bg-[#1E8E5A]",
    icon: CheckCircle2,
    cardBorder: "border-[#1E8E5A]/25",
    accent: "bg-[#1E8E5A]",
    alertBg: "bg-[#DFF5E9]",
    alertBorder: "border-[#A7F3D0]",
    alertText: "text-[#065F46]",
    desc: "Approved — your membership is now active. Check your dashboard for expiry and progress.",
  },
  rejected: {
    label: "rejected",
    badge: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/15",
    dot: "bg-[#C43D3D]",
    icon: XCircle,
    cardBorder: "border-[#C43D3D]/20",
    accent: "bg-[#C43D3D]",
    alertBg: "bg-[#FEF2F2]",
    alertBorder: "border-[#FECACA]",
    alertText: "text-[#991B1B]",
    desc: "Request was rejected. Check the admin note above and try again.",
  },
  expired: {
    label: "expired",
    badge: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/15",
    dot: "bg-[#C43D3D]",
    icon: XCircle,
    cardBorder: "border-[#C43D3D]/20",
    accent: "bg-[#C43D3D]",
    alertBg: "bg-[#FEF2F2]",
    alertBorder: "border-[#FECACA]",
    alertText: "text-[#991B1B]",
    desc: "Membership expired — renew to stay active.",
  },
}

function LatestRequestCard({ data, currentPlan, loading, error, onRetry, onTryAgain }) {
  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-[var(--ink-300)] bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 flex-1">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-[#FECACA] bg-[#FEF2F2] shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[#991B1B]">
            <span className="size-8 rounded-full bg-white border border-[#FECACA] inline-flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">Could not load latest request</div>
              <div className="text-xs opacity-80">{error}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 rounded-full border-[#FECACA] bg-white hover:bg-white min-h-9 shrink-0">
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-dashed border-[var(--ink-300)] bg-white shadow-sm">
        <CardContent className="p-5 sm:p-6 text-center">
          <div className="mx-auto size-10 rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] inline-flex items-center justify-center">
            <Receipt className="size-5 text-[var(--ink-600)]" />
          </div>
          <div className="mt-3 font-display font-semibold text-[var(--ink-900)] text-sm">No membership requests yet</div>
          <div className="mt-1 text-xs sm:text-sm text-[var(--ink-600)] max-w-[36ch] mx-auto leading-relaxed">
            Your latest request will appear here first. Choose a plan below to submit your first payment — admin will review it shortly.
          </div>
        </CardContent>
      </Card>
    )
  }

  const isLinkedExpired = !!currentPlan?.is_expired && String(currentPlan?.request_id) === String(data.id)
  const isAnyExpired = !!currentPlan?.is_expired
  const effectiveAlertStatus = data.status === "approved" && isLinkedExpired ? "expired" : data.status
  const meta = statusMeta[data.status] || statusMeta.pending
  const alertMeta = statusMeta[effectiveAlertStatus] || meta
  const cardMeta = isLinkedExpired ? statusMeta.expired : meta
  const StatusIcon = alertMeta.icon

  return (
    <Card className={`overflow-hidden rounded-2xl bg-white shadow-sm border ${cardMeta.cardBorder} p-0 gap-0`}>
      <div className={`h-1 w-full shrink-0 ${cardMeta.accent}`} />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="size-10 rounded-xl bg-[var(--ink-900)] text-white inline-flex items-center justify-center shrink-0 shadow-sm">
              <Receipt className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-[15px] sm:text-[16px] leading-none text-[var(--ink-900)]">Latest Request</h2>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 gap-1.5 border ${meta.badge}`}
                >
                  <span className={`size-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </Badge>
                {isLinkedExpired && (
                  <Badge variant="outline" className="rounded-full text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 gap-1.5 border bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/15">
                    <span className="size-1.5 rounded-full bg-[#C43D3D]" /> No active membership
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--ink-600)] mt-1 leading-none">Your most recent membership submission</p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--ink-600)] whitespace-nowrap shrink-0">
            <Clock className="size-3.5" />
            {data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}
          </span>
        </div>

        <div className="sm:hidden flex items-center gap-1.5 text-xs text-[var(--ink-600)] -mt-1">
          <Clock className="size-3.5" />
          Submitted {data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 sm:p-3.5">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Plan</div>
            <div className="mt-1 font-display font-bold text-[13px] sm:text-sm text-[var(--ink-900)] leading-tight">{data.plan_label}</div>
            <div className="text-[11px] text-[var(--ink-600)] capitalize">{data.plan_type}</div>
          </div>
          <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Amount</div>
            <div className="mt-1 font-display font-bold text-[15px] sm:text-base text-[var(--ink-900)] tabular-nums">₱{Number(data.amount).toLocaleString()}</div>
            <div className="text-[11px] text-[var(--ink-600)]">Paid via GCash</div>
          </div>
          <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Reference</div>
            <div className="mt-1 font-mono text-[13px] font-semibold text-[var(--ink-900)] truncate" title={data.reference_number}>
              {data.reference_number}
            </div>
            <div className="text-[11px] text-[var(--ink-600)]">Transaction ID</div>
          </div>
          <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5 hidden lg:block">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Submitted</div>
            <div className="mt-1 font-medium text-[13px] sm:text-sm text-[var(--ink-900)]">
              {data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}
            </div>
            <div className="text-[11px] text-[var(--ink-600)]">
              {data.created_at ? new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5 lg:hidden">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Submitted</div>
            <div className="mt-1 font-medium text-[13px] text-[var(--ink-900)]">
              {data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}
            </div>
            <div className="text-[11px] text-[var(--ink-600)] truncate">
              {data.created_at ? new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </div>
          </div>
        </div>
      </div>

      {data.admin_note ? (
        <div className="border-t border-[var(--ink-300)] bg-[var(--surface-0)]">
          <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--ink-300)] bg-white flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Admin note</span>
            <span className={`size-1.5 rounded-full ${cardMeta.dot} sm:hidden`} />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-600)]">
              <Info className="size-3.5" /> From admin
            </span>
          </div>
          <div className="px-4 sm:px-5 py-3.5">
            <p className="text-sm text-[var(--ink-900)] leading-relaxed whitespace-pre-wrap break-words">{data.admin_note}</p>
          </div>
        </div>
      ) : null}

      <div className={`flex items-start gap-2.5 border-t px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed ${alertMeta.alertBg} ${alertMeta.alertBorder} ${alertMeta.alertText}`}>
        <StatusIcon className="size-4 mt-0.5 shrink-0" />
        <span className="font-medium">
          {data.status === "rejected" && "✕ Request was rejected. Check the admin note above and try again."}
          {data.status === "pending" && "⏳ Waiting for admin approval — you'll be notified once verified."}
          {data.status === "approved" && isLinkedExpired && "No active membership"}
          {data.status === "approved" && !isLinkedExpired && isAnyExpired && "No active membership"}
          {data.status === "approved" && !isLinkedExpired && !isAnyExpired && "✓ Approved — your membership is now active."}
          {!["rejected", "pending", "approved"].includes(data.status) && alertMeta.desc}
        </span>
      </div>

      {data.status === "rejected" ? (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-t border-[var(--ink-300)]">
          <p className="text-xs text-[var(--ink-600)] leading-relaxed">Pick a plan below and resubmit your receipt — double-check your reference number.</p>
          <Button
            onClick={onTryAgain}
            size="sm"
            className="rounded-full bg-[var(--ink-900)] hover:bg-black text-white gap-1.5 min-h-9 shrink-0 w-full sm:w-auto"
          >
            Try again <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : isLinkedExpired ? (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-t border-[var(--ink-300)]">
          <p className="text-xs text-[var(--ink-600)] leading-relaxed">No active membership</p>
          <Button
            onClick={onTryAgain}
            size="sm"
            className="rounded-full bg-[#C43D3D] hover:bg-[#A33232] text-white gap-1.5 min-h-9 shrink-0 w-full sm:w-auto"
          >
            Renew now <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

function PaymentQRDialog({ open, onOpenChange, plan, onSubmit }) {
  const [copied, setCopied] = useState(false)
  if (!plan) return null

  const paymentData = `FITPAY|${plan.id.toUpperCase()}|${plan.amount}|${Date.now()}`
  const gcashNumber = "09123456789"

  const handleCopy = () => {
    navigator.clipboard.writeText(gcashNumber)
    setCopied(true)
    toast.success("GCash number copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
        <div className={`bg-gradient-to-br ${plan.gradient} px-6 py-5 text-white text-center`}>
          <DialogTitle className="text-lg font-display font-bold text-white">{plan.name}</DialogTitle>
          <DialogDescription className="text-white/80 text-xs mt-1">Scan the QR code to pay</DialogDescription>
          <div className="mt-3">
            <span className="text-3xl font-display font-bold">{plan.price}</span>
            <span className="text-xs text-white/70 ml-1">/ {plan.period}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-6">
          <div className="rounded-2xl border-2 border-[var(--ink-300)] bg-white p-4 shadow-sm">
            <QRCodeSVG value={paymentData} size={180} level="M" fgColor="#1a1a1a" bgColor="#ffffff" />
          </div>

          <div className="w-full space-y-2">
            <div className="text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Or send via GCash</div>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] px-4 py-3 text-sm font-semibold text-[var(--ink-900)] hover:bg-white hover:border-[var(--grow-500)]/30 transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="size-4 text-[#1E8E5A]" /> : <Copy className="size-4 text-[var(--ink-600)]" />}
              {copied ? "Copied!" : gcashNumber}
            </button>
          </div>

          <div className="w-full rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ink-600)]">Amount</span>
              <span className="font-semibold text-[var(--ink-900)]">{plan.price}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ink-600)]">Plan</span>
              <span className="font-semibold text-[var(--ink-900)]">{plan.name}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              onOpenChange(false)
              onSubmit(plan)
            }}
            className="w-full min-h-11 cursor-pointer font-semibold text-white rounded-lg gap-2"
            style={{ background: plan.color }}
          >
            Submit Payment <ArrowRight className="size-4" />
          </Button>

          <p className="text-[11px] text-[var(--ink-600)] text-center leading-relaxed">
            After payment, submit your receipt for admin approval. Your membership will be activated once verified.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentSubmitDialog({ open, onOpenChange, plan, onSuccess }) {
  const [reference, setReference] = useState("")
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

  const handleClose = () => {
    const wasSubmitted = submitted
    setReference("")
    setReceiptFile(null)
    setReceiptPreview(null)
    setErrors({})
    setSubmitted(false)
    onOpenChange(false)
    if (wasSubmitted && onSuccess) onSuccess()
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      setReceiptFile(null)
      setReceiptPreview(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, receipt: ["Receipt must be under 5MB."] }))
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    setErrors((p) => ({ ...p, receipt: undefined }))
    setReceiptFile(file)
    setReceiptPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!reference.trim()) {
      setErrors({ reference: ["Reference number is required."] })
      return
    }
    if (!receiptFile) {
      setErrors({ receipt: ["Receipt image is required."] })
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("plan_type", plan.id)
      fd.append("amount", plan.amount)
      fd.append("reference_number", reference.trim())
      fd.append("receipt", receiptFile)

      await api.post("/membership-requests", fd)
      setSubmitted(true)
      toast.success("Payment submitted — waiting for admin approval")
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
        toast.error(err.response.data.message || "Validation failed.")
      } else {
        toast.error(err.response?.data?.message || "Failed to submit payment.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!plan) return null

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
          <div className={`bg-gradient-to-br ${plan.gradient} px-6 py-5 text-white text-center`}>
            <DialogTitle className="text-lg font-display font-bold text-white">Payment Submitted</DialogTitle>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div className="size-16 rounded-full bg-[#DFF5E9] inline-flex items-center justify-center">
              <CheckCircle2 className="size-8 text-[#1E8E5A]" />
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-semibold text-[var(--ink-900)]">Waiting for admin approval</div>
              <div className="text-xs text-[var(--ink-600)]">
                Your <span className="font-semibold">{plan.name}</span> request has been submitted. You will be notified once approved.
              </div>
            </div>
            <div className="w-full rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink-600)]">Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#B8790A]">
                  <span className="size-1.5 rounded-full bg-[#B8790A]" /> Pending
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink-600)]">Reference</span>
                <span className="font-mono text-[11px] text-[var(--ink-900)]">{reference}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink-600)]">Amount</span>
                <span className="font-semibold text-[var(--ink-900)]">{plan.price}</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full min-h-11 cursor-pointer" variant="outline">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl">
        <div className={`bg-gradient-to-br ${plan.gradient} px-6 py-5 text-white text-center`}>
          <DialogTitle className="text-lg font-display font-bold text-white">Submit Payment</DialogTitle>
          <DialogDescription className="text-white/80 text-xs mt-1">Upload your receipt for {plan.name}</DialogDescription>
          <div className="mt-3">
            <span className="text-3xl font-display font-bold">{plan.price}</span>
            <span className="text-xs text-white/70 ml-1">/ {plan.period}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6">
          <div className="space-y-1.5">
            <Label htmlFor="reference" className="text-xs font-medium">
              Reference number <span className="text-[#C43D3D]">*</span>
            </Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. GCash ref number or transaction ID"
              className={`h-11 ${errors.reference ? "border-[#C43D3D]" : ""}`}
            />
            {errors.reference && <p className="text-[11px] text-[#C43D3D]">{errors.reference[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Payment receipt <span className="text-[#C43D3D]">*</span>
            </Label>
            {receiptPreview ? (
              <div className="relative rounded-xl border border-[var(--ink-300)] overflow-hidden">
                <img src={receiptPreview} alt="Receipt" className="w-full h-40 object-contain bg-[var(--surface-0)]" />
                <button
                  type="button"
                  onClick={() => {
                    setReceiptFile(null)
                    setReceiptPreview(null)
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                  className="absolute top-2 right-2 size-7 rounded-full bg-white/90 border border-[var(--ink-300)] shadow-sm inline-flex items-center justify-center cursor-pointer hover:bg-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--ink-300)] bg-[var(--surface-0)] p-6 cursor-pointer hover:border-[var(--ink-600)] transition-colors">
                <Upload className="size-6 text-[var(--ink-600)]" />
                <div className="text-center">
                  <div className="text-xs font-semibold text-[var(--ink-900)]">Tap to upload receipt</div>
                  <div className="text-[11px] text-[var(--ink-600)]">JPG, PNG or WebP — max 5MB</div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.receipt && <p className="text-[11px] text-[#C43D3D]">{errors.receipt[0]}</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full min-h-11 cursor-pointer font-semibold text-white rounded-lg gap-2"
            style={{ background: plan.color }}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>

          <p className="text-[11px] text-[var(--ink-600)] text-center leading-relaxed">
            Admin will review your payment. You will be notified once your membership is activated.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function MemberMembership() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [latestRequest, setLatestRequest] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [latestLoading, setLatestLoading] = useState(true)
  const [latestError, setLatestError] = useState("")

  const fetchLatest = async () => {
    setLatestLoading(true)
    setLatestError("")
    try {
      const res = await api.get("/dashboard/member")
      setLatestRequest(res.data?.data?.latest_request || null)
      setCurrentPlan(res.data?.data?.current_plan || null)
    } catch (err) {
      setLatestError(err.response?.data?.message || "Failed to load latest request")
    } finally {
      setLatestLoading(false)
    }
  }

  useEffect(() => {
    fetchLatest()
  }, [])

  const handleGetPlan = (plan) => {
    setSelectedPlan(plan)
    setQrOpen(true)
  }

  const handleOpenSubmit = (plan) => {
    setSelectedPlan(plan)
    setSubmitOpen(true)
  }

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <MemberLayout title="Membership">
      <div className="space-y-5 sm:space-y-6">
        <LatestRequestCard
          data={latestRequest}
          currentPlan={currentPlan}
          loading={latestLoading}
          error={latestError}
          onRetry={fetchLatest}
          onTryAgain={scrollToPlans}
        />

        <div id="plans" className="space-y-1.5 scroll-mt-4">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
            <Crown className="size-7 text-[var(--grow-500)]" /> Membership Plans
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-600)]">Choose a plan that fits your training schedule.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border overflow-hidden transition-all hover:shadow-lg flex flex-col ${
                plan.popular ? "shadow-xl sm:-my-4" : "shadow-sm hover:shadow-md"
              }`}
              style={{ borderColor: plan.border }}
            >
              {plan.popular && (
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm"
                    style={{ color: plan.color }}
                  >
                    <Sparkles className="size-3" /> Best Value
                  </span>
                </div>
              )}

              <div className={`bg-gradient-to-br ${plan.gradient} px-5 py-6 sm:py-7 text-white ${plan.popular ? "sm:py-9" : ""}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="size-10 rounded-xl bg-white/20 backdrop-blur inline-flex items-center justify-center">
                    <plan.icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold">{plan.name}</div>
                    <div className="text-[11px] text-white/80">{plan.description}</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-display font-bold tracking-tight">{plan.price}</span>
                  <span className="text-xs font-medium text-white/70">/ {plan.period}</span>
                </div>
              </div>

              <CardContent className={`p-5 space-y-4 flex flex-col flex-1 ${plan.popular ? "sm:p-6" : ""}`}>
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-[13px] text-[var(--ink-900)]">
                      <span
                        className="size-5 rounded-full inline-flex items-center justify-center shrink-0"
                        style={{ background: plan.bgSoft, color: plan.color }}
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full min-h-11 cursor-pointer font-semibold text-white rounded-lg mt-auto"
                  style={{ background: plan.color }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onClick={() => handleGetPlan(plan)}
                >
                  Get {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PaymentQRDialog open={qrOpen} onOpenChange={setQrOpen} plan={selectedPlan} onSubmit={handleOpenSubmit} />
      <PaymentSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} plan={selectedPlan} onSuccess={fetchLatest} />
    </MemberLayout>
  )
}
