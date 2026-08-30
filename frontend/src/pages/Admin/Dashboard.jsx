import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, ShieldCheck, Dumbbell, Wallet, Clock3, AlertTriangle, CheckCircle2, BarChart3, TrendingUp, CalendarDays, CreditCard, Sun, Moon, Sunset, Clock } from "lucide-react"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import StatCard from "@/components/StatCard"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

const iconMap = { Users, ShieldCheck, Dumbbell, Wallet }

function BarChart({ data, labelKey, valueKey, color = "var(--charge-500)", emptyText = "No data" }) {
  if (!data || !data.length) return <p className="text-xs text-[var(--ink-600)] text-center py-8">{emptyText}</p>
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  return (
    <div className="flex items-end gap-2 h-[160px] sm:h-[180px] px-2 sm:px-3">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0
        const h = max ? Math.round((val / max) * 100) : 0
        const height = val === 0 ? 4 : Math.max(8, h)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="text-[11px] font-mono font-semibold text-[var(--ink-900)]">{valueKey === "revenue" ? `₱${val.toLocaleString()}` : val}</div>
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md sm:rounded-t-lg border border-b-0 transition-all"
                style={{ height: `${height}%`, background: color, borderColor: `${color}30`, minHeight: val === 0 ? "4px" : undefined }}
                title={`${d[labelKey]}: ${val}`}
              />
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[var(--ink-600)] truncate w-full text-center">{d[labelKey]}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let mounted = true
    api
      .get("/dashboard/admin")
      .then((res) => {
        if (mounted) setData(res.data.data)
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load admin dashboard")
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
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[118px] rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-[240px] rounded-xl" />
            <Skeleton className="h-[240px] rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Card className="border-[#FBE2E2] bg-[#FBE2E2]">
          <CardContent className="p-6 flex items-center gap-3 text-[#C43D3D]">
            <AlertTriangle className="size-5" /> {error}
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

   const kpis = data?.kpis || {}
  const graphs = data?.graphs || {}
  const tables = data?.tables || {}
  const memberDonut = graphs.member_status_donut || { active: 0, expired: 0, inactive: 0 }
  const activePct = memberDonut.active || 0
  const expiredPct = memberDonut.expired || 0
  const inactivePct = memberDonut.inactive || 0

  const initials = (user?.name || data?.user?.name || "A").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const roleLabel = (data?.user?.role || user?.role || "admin").toLowerCase()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const GreetingIcon = hour < 12 ? Sun : hour < 18 ? Sunset : Moon
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
   return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6 sm:space-y-8">
        <Card className="overflow-hidden rounded-2xl border-[var(--ink-300)] bg-white shadow-sm">
          <div className="h-1 w-full bg-[var(--charge-500)]" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-[var(--charge-500)] text-white shadow-sm shrink-0">
                  <span className="font-display font-bold text-lg sm:text-xl">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--charge-500)]">
                    <GreetingIcon className="size-3.5" /> {greeting}
                  </div>
                  <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none truncate">
                    Welcome, <span className="text-[var(--charge-500)]">{data?.user?.name || user?.name}</span>
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--charge-500)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      <ShieldCheck className="size-3" /> {roleLabel}
                    </span>
                    <span className="text-xs text-[var(--ink-600)] hidden sm:inline">{data?.user?.email || user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:text-right shrink-0 bg-[var(--surface-0)] lg:bg-transparent border lg:border-0 border-[var(--ink-300)] rounded-xl lg:rounded-none p-3 lg:p-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-900)]">
                  <CalendarDays className="size-4 text-[var(--charge-500)] hidden sm:block" />
                  <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--ink-900)] bg-white border border-[var(--ink-300)] rounded-full px-3 py-1.5 lg:ml-auto">
                  <Clock className="size-3.5 text-[var(--charge-500)]" /> {timeStr}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(data?.stats || []).map((s, idx) => {
            const Icon = iconMap[s.icon] || Users
            const tones = ["charge", "grow", "neutral", "warning"]
            return <StatCard key={s.label} label={s.label} value={s.value} icon={Icon} tone={tones[idx % tones.length]} />
          })}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center justify-center gap-1"><Users className="size-3" /> Members</div>
              <div className="font-display font-bold text-lg sm:text-xl text-[var(--ink-900)]">{kpis.members?.total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{kpis.members?.active ?? 0} active · {kpis.members?.expired ?? 0} expired</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center justify-center gap-1"><ShieldCheck className="size-3" /> Memberships</div>
              <div className="font-display font-bold text-lg sm:text-xl text-[var(--ink-900)]">{kpis.memberships?.total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{kpis.memberships?.active ?? 0} active</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center justify-center gap-1"><CreditCard className="size-3" /> Revenue</div>
              <div className="font-display font-bold text-lg sm:text-xl text-[var(--ink-900)]">₱{Number(kpis.payments?.revenue ?? 0).toLocaleString()}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{kpis.payments?.total ?? 0} payments</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center justify-center gap-1"><CalendarDays className="size-3" /> Today</div>
              <div className="font-display font-bold text-lg sm:text-xl text-[var(--ink-900)]">{kpis.attendance?.today_total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{kpis.attendance?.today_present ?? 0} present · {kpis.attendance?.today_completed ?? 0} done</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <BarChart3 className="size-5 text-[var(--charge-500)]" /> Payments last 6 months
              </CardTitle>
              <CardDescription className="text-xs">Revenue trend from report module</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={graphs.payments_last_6_months || []} labelKey="month" valueKey="revenue" color="var(--charge-500)" emptyText="No payments yet" />
              <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--ink-600)]">
                <span>Total ₱{Number(kpis.payments?.revenue ?? 0).toLocaleString()}</span>
                <span className="inline-flex items-center gap-1"><TrendingUp className="size-3" /> last 6M</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <ShieldCheck className="size-5 text-[var(--grow-500)]" /> Memberships by plan
              </CardTitle>
              <CardDescription className="text-xs">Distribution from report module</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const byPlan = graphs.memberships_by_plan || {}
                const planData = [
                  { plan: "Daily", count: byPlan.daily || 0, color: "#0D9488" },
                  { plan: "Monthly", count: byPlan.monthly || 0, color: "#7C3AED" },
                  { plan: "Yearly", count: byPlan.yearly || 0, color: "#D97706" },
                ]
                const max = Math.max(...planData.map((d) => d.count), 1)
                return (
                  <div className="space-y-3">
                    <BarChart data={planData} labelKey="plan" valueKey="count" color="var(--charge-500)" emptyText="No memberships" />
                    <div className="grid grid-cols-3 gap-2">
                      {planData.map((d) => (
                        <div key={d.plan} className="rounded-lg border p-2.5 text-center" style={{ borderColor: `${d.color}20`, background: `${d.color}10` }}>
                          <div className="mx-auto size-2 rounded-full mb-1" style={{ background: d.color }} />
                          <div className="text-xs font-semibold" style={{ color: d.color }}>{d.plan}</div>
                          <div className="text-[11px] text-[var(--ink-600)]">{d.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <Clock3 className="size-5 text-[var(--charge-500)]" /> Attendance last 7 days
              </CardTitle>
              <CardDescription className="text-xs">Checked-in counts from report module</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={graphs.attendance_last_7_days || []} labelKey="label" valueKey="count" color="var(--grow-500)" emptyText="No attendance" />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[var(--ink-300)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <Dumbbell className="size-5 text-[var(--grow-500)]" /> Member status
              </CardTitle>
              <CardDescription className="text-xs">Donut from report module — Active / Expired / Inactive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-2">
                <div className="relative size-32 sm:size-36">
                  <div
                    className="size-full rounded-full"
                    style={{
                      background: `conic-gradient(var(--grow-500) 0% ${activePct}%, #B8790A ${activePct}% ${activePct + expiredPct}%, #EDEEF0 ${activePct + expiredPct}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center border border-[var(--ink-300)]">
                    <span className="font-display text-xl font-bold tabular-nums">{activePct}%</span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-600)]">Active</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-[#DFF5E9] bg-[#DFF5E9] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[var(--grow-500)] mb-1.5" />
                  <div className="text-xs font-semibold text-[var(--grow-500)]">Active</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{activePct}%</div>
                </div>
                <div className="rounded-lg border border-[#FCEFD6] bg-[#FCEFD6] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[#B8790A] mb-1.5" />
                  <div className="text-xs font-semibold text-[#B8790A]">Expired</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{expiredPct}%</div>
                </div>
                <div className="rounded-lg border border-[#EDEEF0] bg-[#EDEEF0] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[#5B6168] mb-1.5" />
                  <div className="text-xs font-semibold text-[#5B6168]">Inactive</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{inactivePct}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                <Users className="size-4 text-[var(--ink-600)]" />
                <span className="text-xs sm:text-sm text-[var(--ink-600)]">
                  {kpis.members?.total ?? 0} members · <span className="font-semibold text-[var(--ink-900)]">{kpis.members?.active ?? 0} active</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base"><Users className="size-5 text-[var(--charge-500)]" /> Recent members</CardTitle>
              <CardDescription className="text-xs">From report — latest 5</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Code</TableHead><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(tables.recent_members || []).map((m) => (
                      <TableRow key={m.id}><TableCell className="font-mono text-xs">{m.member_code}</TableCell><TableCell><div className="font-medium text-sm">{m.name}</div><div className="text-xs text-[var(--ink-600)]">{m.email}</div></TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${m.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20"}`}>{m.status}</Badge></TableCell></TableRow>
                    ))}
                    {(!tables.recent_members || tables.recent_members.length === 0) && <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-[var(--ink-600)]">No members</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base"><CreditCard className="size-5 text-[var(--grow-500)]" /> Recent payments</CardTitle>
              <CardDescription className="text-xs">From report — latest 5</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">User</TableHead><TableHead className="font-semibold">Plan</TableHead><TableHead className="font-semibold">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(tables.recent_payments || []).map((p) => (
                      <TableRow key={p.id}><TableCell><div className="font-medium text-sm">{p.user_name}</div><div className="text-xs text-[var(--ink-600)]">{p.amount ? `₱${Number(p.amount).toLocaleString()}` : ""}</div></TableCell><TableCell className="text-xs">{p.plan_label}</TableCell><TableCell className="font-semibold text-sm">₱{Number(p.amount).toLocaleString()}</TableCell></TableRow>
                    ))}
                    {(!tables.recent_payments || tables.recent_payments.length === 0) && <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-[var(--ink-600)]">No payments</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base"><ShieldCheck className="size-5 text-[var(--charge-500)]" /> Recent memberships</CardTitle>
              <CardDescription className="text-xs">From report — latest 5</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Plan</TableHead><TableHead className="font-semibold">Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(tables.recent_memberships || []).map((m) => (
                      <TableRow key={m.id}><TableCell><div className="font-medium text-sm">{m.user_name}</div><div className="text-xs text-[var(--ink-600)]">{m.period}</div></TableCell><TableCell className="text-xs">{m.plan_label}</TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${m.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20"}`}>{m.status}</Badge></TableCell></TableRow>
                    ))}
                    {(!tables.recent_memberships || tables.recent_memberships.length === 0) && <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-[var(--ink-600)]">No memberships</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-[var(--ink-300)] bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base"><CalendarDays className="size-5 text-[var(--grow-500)]" /> Recent attendance</CardTitle>
              <CardDescription className="text-xs">From report — latest 5</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Date</TableHead><TableHead className="font-semibold">Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(tables.recent_attendances || []).map((a) => (
                      <TableRow key={a.id}><TableCell><div className="font-medium text-sm">{a.member_name}</div><div className="text-xs font-mono text-[var(--ink-600)]">{a.member_code}</div></TableCell><TableCell className="font-mono text-xs">{a.attendance_date}</TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${a.status === "completed" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FEF3C7] text-[#B45309] border-[#B45309]/20"}`}>{a.status}</Badge></TableCell></TableRow>
                    ))}
                    {(!tables.recent_attendances || tables.recent_attendances.length === 0) && <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-[var(--ink-600)]">No attendance</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
