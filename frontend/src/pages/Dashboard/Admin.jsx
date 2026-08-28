import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, ShieldCheck, Dumbbell, Wallet, TrendingUp, Clock3, AlertTriangle, CheckCircle2 } from "lucide-react"
import AdminLayout from "@/components/Layout/AdminLayout"
import StatCard from "@/components/StatCard"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

const iconMap = { Users, ShieldCheck, Dumbbell, Wallet }

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">
            {data?.welcome || `Welcome Admin ${user?.name}`}
          </h1>
          <p className="text-sm text-[var(--ink-600)]">
            Consolidated overview — <span className="font-medium text-[var(--ink-900)]">admin view</span> • role-based access via <span className="font-mono text-xs bg-[var(--charge-100)] px-1.5 py-0.5 rounded text-[var(--charge-500)]">role:admin</span> middleware
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(data?.stats || []).map((s, idx) => {
            const Icon = iconMap[s.icon] || Users
            const tones = ["charge", "grow", "neutral", "warning"]
            return <StatCard key={s.label} label={s.label} value={s.value} icon={Icon} trend={idx === 0 ? "▲12% this week" : undefined} tone={tones[idx % tones.length]} />
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-xl border-[var(--ink-300)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <Clock3 className="size-5 text-[var(--charge-500)]" /> Recent activity
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Last payments & check-ins — timestamped feed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.recent || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-white border border-[var(--ink-300)] text-[var(--charge-500)]">
                      <TrendingUp className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-[var(--ink-900)]">{item.title}</span>
                  </div>
                  <Badge variant="outline" className="bg-white border-[var(--ink-300)] text-[var(--ink-600)] text-[11px]">
                    {item.time}
                  </Badge>
                </div>
              ))}
              <div className="rounded-lg bg-[var(--grow-100)] border border-[#DFF5E9] p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--grow-500)] flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> All systems operational
                </span>
                <Badge className="bg-[var(--grow-500)] text-white hover:bg-[var(--grow-500)]">Live</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[var(--ink-300)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
                <Dumbbell className="size-5 text-[var(--grow-500)]" /> Membership status
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Donut breakdown — Active / Expiring / Expired</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-2">
                <div className="relative size-32 sm:size-36">
                  <div
                    className="size-full rounded-full"
                    style={{
                      background: `conic-gradient(var(--grow-500) 0% 71%, #B8790A 71% 85%, #C43D3D 85% 100%)`,
                    }}
                  />
                  <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center border border-[var(--ink-300)]">
                    <span className="font-display text-xl font-bold tabular-nums">71%</span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-600)]">Active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-[#DFF5E9] bg-[#DFF5E9] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[var(--grow-500)] mb-1.5" />
                  <div className="text-xs font-semibold text-[var(--grow-500)]">Active</div>
                  <div className="text-[11px] text-[var(--ink-600)]">71%</div>
                </div>
                <div className="rounded-lg border border-[#FCEFD6] bg-[#FCEFD6] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[#B8790A] mb-1.5" />
                  <div className="text-xs font-semibold text-[#B8790A]">Expiring</div>
                  <div className="text-[11px] text-[var(--ink-600)]">14%</div>
                </div>
                <div className="rounded-lg border border-[#FBE2E2] bg-[#FBE2E2] p-2.5">
                  <div className="mx-auto size-2 rounded-full bg-[#C43D3D] mb-1.5" />
                  <div className="text-xs font-semibold text-[#C43D3D]">Expired</div>
                  <div className="text-[11px] text-[var(--ink-600)]">15%</div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                <Users className="size-4 text-[var(--ink-600)]" />
                <span className="text-xs sm:text-sm text-[var(--ink-600)]">
                  Signed in as <span className="font-semibold text-[var(--ink-900)]">{data?.user?.email}</span> — <span className="inline-flex items-center gap-1 rounded-full bg-[var(--charge-500)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">admin</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
