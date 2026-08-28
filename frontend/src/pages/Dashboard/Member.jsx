import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCheck, ShieldCheck, CreditCard, Flame, Clock3, Dumbbell, Play, AlertTriangle } from "lucide-react"
import MemberLayout from "@/components/Layout/MemberLayout"
import StatCard from "@/components/StatCard"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

const iconMap = { CalendarCheck, ShieldCheck, CreditCard, Flame }

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
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">
              {data?.welcome || `Hi ${user?.name} 👋`}
            </h1>
            <p className="text-sm text-[var(--ink-600)] mt-1.5">
              Your personal fitness overview — <span className="font-medium text-[var(--grow-500)]">member view</span> • <span className="font-mono text-xs bg-[var(--grow-100)] px-1.5 py-0.5 rounded text-[var(--grow-500)]">role:member</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[var(--grow-500)] hover:bg-[var(--grow-500)] gap-1.5">
              <span className="size-1.5 rounded-full bg-white animate-pulse" /> Active member
            </Badge>
            <Badge variant="outline" className="border-[var(--ink-300)] bg-white text-[var(--ink-600)]">
              {user?.email}
            </Badge>
          </div>
        </div>

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
                <div className="rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-4">
                  <div className="text-xs font-semibold tracking-widest uppercase text-[var(--ink-600)]">Current plan</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[var(--ink-900)]">Monthly</span>
                    <Badge className="bg-[var(--grow-500)] hover:bg-[var(--grow-500)] gap-1">
                      <span className="size-1.5 rounded-full bg-white" /> Active
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-[var(--ink-600)]">Expires</span>
                    <span className="font-mono font-medium text-[var(--ink-900)]">2026-09-27</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white border border-[var(--ink-300)] overflow-hidden">
                    <div className="h-full w-[68%] bg-[var(--grow-500)]" />
                  </div>
                  <p className="text-[11px] text-[var(--ink-600)] mt-1.5">68% of membership period used — renew soon to keep your streak.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[var(--ink-300)] bg-white p-3 text-center">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[var(--ink-600)]">Next payment</div>
                    <div className="font-display font-bold text-[var(--ink-900)]">Aug 30</div>
                    <div className="text-xs text-[var(--ink-600)]">₱800</div>
                  </div>
                  <div className="rounded-lg border border-[var(--ink-300)] bg-white p-3 text-center">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[var(--ink-600)]">Attendance</div>
                    <div className="font-display font-bold text-[var(--charge-500)]">12x</div>
                    <div className="text-xs text-[var(--ink-600)]">this month</div>
                  </div>
                </div>
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
