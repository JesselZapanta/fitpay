import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCheck, ShieldCheck, CreditCard, Flame, Clock3, Dumbbell, Play, AlertTriangle, Receipt, Clock, CheckCircle2, XCircle, Crown, Info } from "lucide-react"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import StatCard from "@/components/StatCard"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

const iconMap = { CalendarCheck, ShieldCheck, CreditCard, Flame }

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
  },
}

export default function MemberDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    api
      .get("/dashboard/member")
      .then((res) => {
        if (mounted) setData(res.data.data)
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load member dashboard")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <MemberLayout title="My Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[118px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </MemberLayout>
    )
  }

  if (error) {
    return (
      <MemberLayout title="My Dashboard">
        <Card className="border-[#FBE2E2] bg-[#FBE2E2]">
          <CardContent className="p-6 flex items-center gap-3 text-[#C43D3D]">
            <AlertTriangle className="size-5" /> {error}
          </CardContent>
        </Card>
      </MemberLayout>
    )
  }

  return (
    <MemberLayout title="My Dashboard">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-1.5">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">
            {data?.welcome || `Hi ${user?.name} 👋`}
          </h1>
          <p className="text-sm text-[var(--ink-600)]">Your personal fitness overview — track your progress and membership.</p>
        </div>

        {data?.latest_request &&
          (() => {
            const req = data.latest_request
            const isLinkedExpired = !!data.current_plan?.is_expired && String(data.current_plan?.request_id) === String(req.id)
            const isAnyExpired = !!data.current_plan?.is_expired
            const effectiveAlertStatus = req.status === "approved" && isLinkedExpired ? "expired" : req.status
            const meta = statusMeta[req.status] || statusMeta.pending
            const alertMeta = statusMeta[effectiveAlertStatus] || meta
            const cardMeta = isLinkedExpired ? statusMeta.expired : meta
            const StatusIcon = alertMeta.icon
            return (
              <Card className={`overflow-hidden rounded-2xl bg-white shadow-sm border p-0 gap-0 ${cardMeta.cardBorder}`}>
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
                          <Badge variant="outline" className={`rounded-full text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 gap-1.5 border ${meta.badge}`}>
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
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>

                  <div className="sm:hidden flex items-center gap-1.5 text-xs text-[var(--ink-600)] -mt-1">
                    <Clock className="size-3.5" />
                    Submitted {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 sm:p-3.5">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Plan</div>
                      <div className="mt-1 font-display font-bold text-[13px] sm:text-sm text-[var(--ink-900)] leading-tight">{req.plan_label}</div>
                      <div className="text-[11px] text-[var(--ink-600)] capitalize">{req.plan_type}</div>
                    </div>
                    <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Amount</div>
                      <div className="mt-1 font-display font-bold text-[15px] sm:text-base text-[var(--ink-900)] tabular-nums">₱{Number(req.amount).toLocaleString()}</div>
                      <div className="text-[11px] text-[var(--ink-600)]">Paid via GCash</div>
                    </div>
                    <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Reference</div>
                      <div className="mt-1 font-mono text-[13px] font-semibold text-[var(--ink-900)] truncate" title={req.reference_number}>
                        {req.reference_number}
                      </div>
                      <div className="text-[11px] text-[var(--ink-600)]">Transaction ID</div>
                    </div>
                    <div className="rounded-xl border border-[var(--ink-300)] bg-white p-3 sm:p-3.5">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Submitted</div>
                      <div className="mt-1 font-medium text-[13px] sm:text-sm text-[var(--ink-900)]">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                      </div>
                      <div className="text-[11px] text-[var(--ink-600)] truncate">
                        {req.created_at ? new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {req.admin_note ? (
                  <div className="border-t border-[var(--ink-300)] bg-[var(--surface-0)]">
                    <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--ink-300)] bg-white flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Admin note</span>
                      <span className={`size-1.5 rounded-full ${cardMeta.dot} sm:hidden`} />
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-600)]">
                        <Info className="size-3.5" /> From admin
                      </span>
                    </div>
                    <div className="px-4 sm:px-5 py-3.5">
                      <p className="text-sm text-[var(--ink-900)] leading-relaxed whitespace-pre-wrap break-words">{req.admin_note}</p>
                    </div>
                  </div>
                ) : null}

                <div className={`flex items-start gap-2.5 border-t px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed ${alertMeta.alertBg} ${alertMeta.alertBorder} ${alertMeta.alertText}`}>
                  <StatusIcon className="size-4 mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {req.status === "rejected" && "✕ Request was rejected. Check the admin note above and try again."}
                    {req.status === "pending" && "⏳ Waiting for admin approval — you'll be notified once verified."}
                    {req.status === "approved" && isLinkedExpired && "No active membership"}
                    {req.status === "approved" && !isLinkedExpired && isAnyExpired && "No active membership"}
                    {req.status === "approved" && !isLinkedExpired && !isAnyExpired && "✓ Approved — your membership is now active."}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-5 py-3.5 bg-white border-t border-[var(--ink-300)]">
                  <p className="text-xs text-[var(--ink-600)] leading-relaxed">
                    {req.status === "rejected"
                      ? "Pick a plan and resubmit — double-check your reference number."
                      : req.status === "pending"
                        ? "Admin will verify your receipt shortly."
                        : isLinkedExpired || isAnyExpired
                          ? "No active membership"
                          : "Your membership is active — check expiry below."}
                  </p>
                  <Button asChild size="sm" className="rounded-full bg-[var(--ink-900)] hover:bg-black text-white gap-1.5 min-h-9 shrink-0 w-full sm:w-auto">
                    <Link to="/member/membership">
                      <Crown className="size-4" /> View Membership
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(data?.stats || []).map((s, idx) => {
            const Icon = iconMap[s.icon] || Dumbbell
            const tones = ["grow", "charge", "neutral", "warning"]
            return <StatCard key={s.label} label={s.label} value={s.value} icon={Icon} trend={idx === 0 ? "keep it up!" : undefined} tone={tones[idx % tones.length]} />
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <Dumbbell className="size-5 text-[var(--charge-500)]" /> Weekly schedule
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your trainer-planned sessions — stay consistent, grow stronger.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.schedule || []).map((row) => (
                <div key={row.day} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--charge-500)] text-white font-display font-bold text-sm">
                      {row.day}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--ink-900)]">{row.activity}</div>
                      <div className="text-xs text-[var(--ink-600)] flex items-center gap-1">
                        <Clock3 className="size-3" /> {row.time}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full bg-white border border-[var(--ink-300)] text-[var(--ink-900)] hover:bg-[var(--charge-500)] hover:text-white hover:border-[var(--charge-500)] gap-1.5 min-h-9">
                    <Play className="size-3.5" /> Start
                  </Button>
                </div>
              ))}
              <div className="rounded-xl bg-[var(--grow-100)] border border-[#DFF5E9] p-4">
                <p className="text-sm font-semibold text-[var(--grow-500)]">Tip — Charge streak</p>
                <p className="text-xs text-[var(--ink-600)] mt-1 leading-relaxed">
                  You’ve checked in 3x this week. One more and you’ll beat last week’s record. The front-desk tablet is ready — just tap <span className="font-semibold text-[var(--ink-900)]">Check In</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-xl border-[var(--ink-300)] bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <ShieldCheck className="size-5 text-[var(--grow-500)]" /> Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.current_plan ? (
                  <div className="rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-4">
                    <div className="text-xs font-semibold tracking-widest uppercase text-[var(--ink-600)]">Current plan</div>
                    <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-xl font-bold text-[var(--ink-900)]">{data.current_plan.plan_label}</span>
                      <Badge className={`${data.current_plan.is_expired ? "bg-[#C43D3D] hover:bg-[#C43D3D]" : "bg-[var(--grow-500)] hover:bg-[var(--grow-500)]"} gap-1`}>
                        <span className="size-1.5 rounded-full bg-white" /> {data.current_plan.is_expired ? "Expired" : "Active"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-[var(--ink-600)]">₱{Number(data.current_plan.amount).toLocaleString()} · {data.current_plan.plan_type}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[var(--ink-600)]">Expires</span>
                      <span className="font-mono font-medium text-[var(--ink-900)]">{data.current_plan.expires_date}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white border border-[var(--ink-300)] overflow-hidden">
                      <div className="h-full bg-[var(--grow-500)] transition-all" style={{ width: `${data.current_plan.progress}%`, background: data.current_plan.is_expired ? "#C43D3D" : undefined }} />
                    </div>
                    <p className="text-[11px] text-[var(--ink-600)] mt-1.5">
                      {data.current_plan.is_expired ? "No active membership" : `${data.current_plan.progress}% used · ${data.current_plan.days_left} days left — renew soon to keep your streak.`}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[var(--surface-0)] border border-dashed border-[var(--ink-300)] p-4 text-center">
                    <Crown className="size-6 mx-auto text-[var(--ink-600)] opacity-40" />
                    <div className="text-sm font-semibold text-[var(--ink-900)] mt-2">No active plan</div>
                    <p className="text-xs text-[var(--ink-600)] mt-1">Choose a plan to start your membership.</p>
                    <Button asChild size="sm" className="mt-3 bg-[var(--grow-500)] hover:bg-[#0F766E] text-white gap-1.5 min-h-9 cursor-pointer">
                      <Link to="/member/membership"><Crown className="size-4" /> View Plans</Link>
                    </Button>
                  </div>
                )}

                {data?.current_plan && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[var(--ink-300)] bg-white p-3 text-center">
                      <div className="text-[11px] font-semibold tracking-wide uppercase text-[var(--ink-600)]">Next payment</div>
                      <div className="font-display font-bold text-[var(--ink-900)]">{new Date(data.current_plan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                      <div className="text-xs text-[var(--ink-600)]">₱{Number(data.current_plan.amount).toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--ink-300)] bg-white p-3 text-center">
                      <div className="text-[11px] font-semibold tracking-wide uppercase text-[var(--ink-600)]">Attendance</div>
                      <div className="font-display font-bold text-[var(--charge-500)]">12x</div>
                      <div className="text-xs text-[var(--ink-600)]">this month</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-[var(--ink-300)] bg-[var(--charge-500)] text-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white text-[var(--charge-500)]">
                  <Flame className="size-6" />
                </div>
                <div>
                  <div className="font-display font-semibold">5-day streak 🔥</div>
                  <div className="text-sm text-white/90">You’re in the top 20% of members this month.</div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </MemberLayout>
  )
}
