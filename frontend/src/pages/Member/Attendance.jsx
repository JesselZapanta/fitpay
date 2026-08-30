import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { CalendarCheck, Clock, LogIn, LogOut, Timer, CheckCircle2, Circle, CalendarDays, Flame, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import api from "@/lib/api"

function StatusBadge({ status }) {
  if (status === "present")
    return (
      <Badge variant="outline" className="rounded-full bg-[#FEF3C7] text-[#B45309] border-[#B45309]/20 px-2.5 py-0.5 text-[11px] font-semibold gap-1">
        <Clock className="size-3" /> present
      </Badge>
    )
  if (status === "completed")
    return (
      <Badge variant="outline" className="rounded-full bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20 px-2.5 py-0.5 text-[11px] font-semibold gap-1">
        <CheckCircle2 className="size-3" /> done
      </Badge>
    )
  return (
    <Badge variant="outline" className="rounded-full bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20 px-2.5 py-0.5 text-[11px] font-semibold">
      {status}
    </Badge>
  )
}

export default function MemberAttendance() {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const [today, setToday] = useState(null)
  const [stats, setStats] = useState({ total: 0, this_month: 0, has_active_membership: false })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [month, setMonth] = useState("all")
  const [actionLoading, setActionLoading] = useState(null)

  const fetchAttendances = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (month !== "all") params.month = month
      const { data: res } = await api.get("/member/attendances", { params })
      setData(res.data || [])
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
      setToday(res.today || null)
      setStats(res.stats || { total: 0, this_month: 0, has_active_membership: false })
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, month])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  useEffect(() => {
    setPage(1)
  }, [month])

  const handleCheckIn = async () => {
    setActionLoading("in")
    try {
      const { data } = await api.post("/member/attendances/check-in")
      toast.success(data.message || "Checked in successfully")
      fetchAttendances()
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading("out")
    try {
      const { data } = await api.post("/member/attendances/check-out")
      toast.success(data.message || "Checked out successfully")
      fetchAttendances()
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed")
    } finally {
      setActionLoading(null)
    }
  }

  const canCheckIn = stats.has_active_membership && (!today || !today.check_in)
  const canCheckOut = !!today?.check_in && !today?.check_out
  const isTodayCompleted = !!today?.check_in && !!today?.check_out

  return (
    <MemberLayout title="Attendance">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
            <CalendarCheck className="size-7 text-[var(--grow-500)]" /> My Attendance
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-600)]">Track your gym visits — check in, check out, and view your history.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Total visits</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--ink-900)]">{stats.total}</div>
              <div className="text-[11px] text-[var(--ink-600)]">all time</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">This month</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--charge-500)]">{stats.this_month}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{new Date().toLocaleString(undefined, { month: "short" })}</div>
            </CardContent>
          </Card>
          <Card className={`${stats.has_active_membership ? "border-[#A7F3D0] bg-[#DFF5E9]" : "border-[#FECACA] bg-[#FEF2F2]"}`}>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className={`text-[11px] font-bold tracking-widest uppercase ${stats.has_active_membership ? "text-[#065F46]" : "text-[#991B1B]"}`}>Membership</div>
              <div className={`font-display font-bold text-sm sm:text-base ${stats.has_active_membership ? "text-[#1E8E5A]" : "text-[#C43D3D]"}`}>{stats.has_active_membership ? "Active" : "No active"}</div>
              <div className={`text-[11px] ${stats.has_active_membership ? "text-[#065F46]" : "text-[#991B1B]"}`}>{stats.has_active_membership ? "can check in" : "renew needed"}</div>
            </CardContent>
          </Card>
        </div>



        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <CalendarDays className="size-5 text-[var(--charge-500)]" /> History
            </CardTitle>
            <CardDescription className="text-xs">Your past visits — filter by month or search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Select
                  value={month}
                  onValueChange={(v) => {
                    setMonth(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-11 cursor-pointer">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                <span className="hidden sm:inline-flex text-xs text-[var(--ink-600)]">
                  {meta.total > 0 ? (
                    <>{meta.from}–{meta.to} of {meta.total}</>
                  ) : (
                    "No results"
                  )}
                </span>
              </div>
            </div>

            <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--ink-300)] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--surface-0)]">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Check In</TableHead>
                    <TableHead className="font-semibold">Check Out</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <CalendarCheck className="size-8 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-medium">No attendance yet</p>
                        <p className="text-xs text-[var(--ink-600)]">Your visits will appear here after you check in.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((a) => (
                      <TableRow key={a.id} className="hover:bg-[var(--surface-0)]">
                        <TableCell className="font-mono text-sm">{a.attendance_date}</TableCell>
                        <TableCell><span className="inline-flex items-center gap-1.5 font-mono text-sm"><LogIn className="size-3.5 text-[var(--charge-500)]" /> {a.check_in || "—"}</span></TableCell>
                        <TableCell><span className="inline-flex items-center gap-1.5 font-mono text-sm">{a.check_out ? <><LogOut className="size-3.5 text-[var(--grow-500)]" /> {a.check_out}</> : "—"}</span></TableCell>
                        <TableCell className="font-mono text-xs">{a.duration || "—"}</TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 sm:hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-32" /></Card>
                ))
              ) : data.length === 0 ? (
                <Card className="border-dashed p-6 text-center">
                  <CalendarCheck className="size-8 mx-auto opacity-20 mb-2" />
                  <p className="text-sm font-medium">No records</p>
                  <p className="text-xs text-[var(--ink-600)]">No attendance for selected month.</p>
                </Card>
              ) : (
                data.map((a) => (
                  <Card key={a.id} className="border-[var(--ink-300)] shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm font-semibold">{a.attendance_date}</div>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-3">
                        <div>
                          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1"><LogIn className="size-3" /> In</div>
                          <div className="font-mono font-semibold mt-1">{a.check_in || "—"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1"><LogOut className="size-3" /> Out</div>
                          <div className="font-mono font-semibold mt-1">{a.check_out || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Duration</div>
                          <div className="font-mono font-semibold mt-1">{a.duration || "—"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[var(--ink-600)] text-center sm:text-left">
                Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of <span className="font-semibold">{meta.last_page}</span> · {meta.total} total
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={meta.current_page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 cursor-pointer gap-1.5">
                  <ChevronLeft className="size-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page || loading} onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} className="min-h-11 cursor-pointer gap-1.5">
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  )
}
