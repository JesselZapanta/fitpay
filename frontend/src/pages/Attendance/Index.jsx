import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X, CalendarCheck, Clock, LogIn, LogOut, Users, Filter, ChevronLeft, ChevronRight, Timer, CheckCircle2, Circle, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
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

export default function AdminAttendance() {
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState("")
  const [debouncedMemberSearch, setDebouncedMemberSearch] = useState("")
  const [memberLoading, setMemberLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const memberBoxRef = useRef(null)

  const [actionLoading, setActionLoading] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const [stats, setStats] = useState({ today_total: 0, today_present: 0, today_completed: 0, today_date: "" })
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10))
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [tab, setTab] = useState("today")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMemberSearch(memberSearch), 300)
    return () => clearTimeout(t)
  }, [memberSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (memberBoxRef.current && !memberBoxRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const fetchMembers = useCallback(async () => {
    setMemberLoading(true)
    try {
      const { data } = await api.get("/members", { params: { search: debouncedMemberSearch || undefined, per_page: 8 } })
      setMembers(data.data || [])
      if (debouncedMemberSearch) setShowDropdown(true)
    } catch {
      setMembers([])
    } finally {
      setMemberLoading(false)
    }
  }, [debouncedMemberSearch])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const fetchAttendances = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10, date: filterDate }
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await api.get("/attendances", { params })
      setAttendances(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
      if (data.stats) setStats(data.stats)
    } catch {
      setAttendances([])
    } finally {
      setLoading(false)
    }
  }, [page, filterDate, debouncedSearch])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  useEffect(() => {
    setPage(1)
  }, [filterDate, debouncedSearch])

  const handleCheckIn = async () => {
    if (!selectedMember) {
      toast.error("Select a member first")
      return
    }
    setActionLoading("in")
    try {
      await api.post("/attendances/check-in", { member_id: selectedMember.id, attendance_date: filterDate })
      toast.success(`Checked in — ${selectedMember.name || selectedMember.member_code}`)
      fetchAttendances()
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedMember) {
      toast.error("Select a member first")
      return
    }
    setActionLoading("out")
    try {
      await api.post("/attendances/check-out", { member_id: selectedMember.id, attendance_date: filterDate })
      toast.success(`Checked out — ${selectedMember.name || selectedMember.member_code}`)
      fetchAttendances()
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed")
    } finally {
      setActionLoading(null)
    }
  }

  const selectMember = (m) => {
    setSelectedMember(m)
    setMemberSearch("")
    setShowDropdown(false)
  }

  const clearMember = () => {
    setSelectedMember(null)
    setMemberSearch("")
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const isToday = filterDate === todayStr

  return (
    <AdminLayout title="Attendance">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
                  <CalendarCheck className="size-7 text-[var(--charge-500)]" /> Attendance
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)] mt-1.5">Front-desk check-in / check-out — today first, history second. Large touch targets for tablet.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--ink-600)]">
                  <Timer className="size-4" /> {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <Badge variant="outline" className="rounded-full bg-[var(--charge-100)] text-[var(--charge-500)] border-[var(--charge-500)]/15 px-3 py-1 text-xs font-semibold">
                  {stats.today_date || todayStr}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Today total</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--ink-900)]">{stats.today_total}</div>
              <div className="text-[11px] text-[var(--ink-600)]">records</div>
            </CardContent>
          </Card>
          <Card className="border-[#FDE68A] bg-[#FFFBEB]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#92400E]">Present</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[#B45309]">{stats.today_present}</div>
              <div className="text-[11px] text-[#92400E]">checked in</div>
            </CardContent>
          </Card>
          <Card className="border-[#A7F3D0] bg-[#DFF5E9]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#065F46]">Done</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[#1E8E5A]">{stats.today_completed}</div>
              <div className="text-[11px] text-[#065F46]">checked out</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-[var(--ink-900)] flex items-center gap-1.5">
                <Users className="size-3.5 text-[var(--ink-600)]" /> Select member to check in / out
              </Label>
              <p className="text-[11px] text-[var(--ink-600)] mt-0.5">Search by name, code or phone — tap a result to select. ≤2 taps on mobile.</p>
            </div>

            <div ref={memberBoxRef} className="relative">
              {selectedMember ? (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--charge-500)] bg-[var(--charge-100)] p-3">
                  <img
                    src={resolvePhotoUrl(selectedMember.photo, selectedMember.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name || "?")}&background=0F766E&color=fff&size=64`}
                    alt={selectedMember.name}
                    className="size-10 rounded-full object-cover border border-white shadow-sm"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--ink-900)] truncate">{selectedMember.name} <span className="font-mono text-xs font-normal text-[var(--ink-600)]">{selectedMember.member_code}</span></div>
                    <div className="text-xs text-[var(--ink-600)] truncate">{selectedMember.email || selectedMember.phone || "—"}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0 cursor-pointer" onClick={clearMember} aria-label="Clear member">
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => { setMemberSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search member — name, MEM-0001, phone…"
                    className="pl-9 h-12 pr-9 text-[15px] rounded-xl border-[var(--ink-300)] focus-visible:border-[var(--charge-500)] focus-visible:ring-[var(--charge-500)]/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 border-[var(--ink-300)] bg-white">tap to pick</Badge>
                  </div>
                </div>
              )}

              {showDropdown && !selectedMember && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--ink-300)] bg-white shadow-xl max-h-[260px] overflow-y-auto">
                  {memberLoading ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <div className="p-6 text-center">
                      <Users className="size-6 mx-auto opacity-30 mb-2" />
                      <p className="text-sm font-medium text-[var(--ink-900)]">No members</p>
                      <p className="text-xs text-[var(--ink-600)]">Try a different search.</p>
                    </div>
                  ) : (
                    <div className="p-1.5 space-y-1">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => selectMember(m)}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] text-left transition-colors cursor-pointer"
                        >
                          <img
                            src={resolvePhotoUrl(m.photo, m.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "?")}&background=E1E4E8&color=5B6168&size=64`}
                            alt={m.name}
                            className="size-8 rounded-full object-cover border border-[var(--ink-300)] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{m.name} <span className="font-mono text-xs text-[var(--ink-600)]">{m.member_code}</span></div>
                            <div className="text-xs text-[var(--ink-600)] truncate">{m.email || m.phone || "—"}</div>
                          </div>
                          <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 border ${m.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : m.status === "expired" ? "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20" : "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20"}`}>{m.status}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={!selectedMember || actionLoading !== null}
                className="h-14 sm:h-14 rounded-xl bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[15px] gap-2 shadow-sm min-h-14 cursor-pointer"
              >
                {actionLoading === "in" ? <Clock className="size-5 animate-spin" /> : <LogIn className="size-5" />}
                {actionLoading === "in" ? "Checking in…" : "Check In"}
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!selectedMember || actionLoading !== null}
                className="h-14 sm:h-14 rounded-xl bg-[var(--grow-500)] hover:bg-[#0F766E] text-white font-semibold text-[15px] gap-2 shadow-sm min-h-14 cursor-pointer"
              >
                {actionLoading === "out" ? <Clock className="size-5 animate-spin" /> : <LogOut className="size-5" />}
                {actionLoading === "out" ? "Checking out…" : "Check Out"}
              </Button>
            </div>
            <p className="text-[11px] text-center text-[var(--ink-600)]">Member must have a valid membership to check in. Both buttons require a selected member.</p>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-1">
            <TabsTrigger value="today" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[var(--ink-900)] cursor-pointer gap-1.5">
              <Circle className="size-3.5" /> Today
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer gap-1.5">
              <CalendarDays className="size-3.5" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-3">
            <Card className="border-[var(--ink-300)] shadow-sm">
              <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-11 w-full sm:w-[180px] cursor-pointer" />
                  <Button variant="outline" size="sm" onClick={() => setFilterDate(todayStr)} className="h-11 cursor-pointer shrink-0 hidden sm:inline-flex">Today</Button>
                </div>
                <div className="relative flex-1 sm:max-w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search member…" className="pl-9 h-11 text-sm" />
                </div>
              </CardContent>
            </Card>

            <div className="hidden sm:block">
              <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--surface-0)]">
                        <TableHead className="font-semibold">Member</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Check In</TableHead>
                        <TableHead className="font-semibold">Check Out</TableHead>
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
                      ) : attendances.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <CalendarCheck className="size-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm font-medium">No attendance for {filterDate}</p>
                            <p className="text-xs text-[var(--ink-600)]">Check in a member above to see records here.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendances.map((a) => (
                          <TableRow key={a.id} className="hover:bg-[var(--surface-0)]">
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <img src={resolvePhotoUrl(a.member?.photo, a.member?.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.member?.name || a.user?.name || "?")}&background=EDEEF0&color=5B6168&size=64`} alt={a.member?.name || a.user?.name} className="size-8 rounded-full object-cover border border-[var(--ink-300)]" />
                                <div>
                                  <div className="font-semibold text-sm leading-tight">{a.member?.name || a.user?.name || "—"}</div>
                                  <div className="text-xs text-[var(--ink-600)] font-mono">{a.member?.member_code || `user #${a.user_id}`}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{a.attendance_date}</TableCell>
                            <TableCell><span className="inline-flex items-center gap-1.5 text-sm font-medium"><Clock className="size-3.5 text-[var(--charge-500)]" /> {a.check_in || "—"}</span></TableCell>
                            <TableCell><span className="inline-flex items-center gap-1.5 text-sm font-medium">{a.check_out ? <><LogOut className="size-3.5 text-[var(--grow-500)]" /> {a.check_out}</> : "—"}</span></TableCell>
                            <TableCell><StatusBadge status={a.status} /></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            <div className="grid gap-3 sm:hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-full" /></Card>
                ))
              ) : attendances.length === 0 ? (
                <Card className="border-dashed p-8 text-center">
                  <CalendarCheck className="size-8 mx-auto opacity-20 mb-2" />
                  <p className="text-sm font-medium">No records</p>
                  <p className="text-xs text-[var(--ink-600)]">No attendance for {filterDate}</p>
                </Card>
              ) : (
                attendances.map((a) => (
                  <Card key={a.id} className="border-[var(--ink-300)] shadow-sm overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img src={resolvePhotoUrl(a.member?.photo, a.member?.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.member?.name || "?")}&background=EDEEF0&color=5B6168&size=64`} alt={a.member?.name} className="size-9 rounded-full object-cover border border-[var(--ink-300)]" />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{a.member?.name || a.user?.name || "—"}</div>
                            <div className="text-xs font-mono text-[var(--ink-600)] truncate">{a.member?.member_code || `user #${a.user_id}`} · {a.attendance_date}</div>
                          </div>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-3 text-xs">
                        <div>
                          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1"><LogIn className="size-3" /> In</div>
                          <div className="font-mono font-semibold mt-1 text-sm">{a.check_in || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1 justify-end"><LogOut className="size-3" /> Out</div>
                          <div className="font-mono font-semibold mt-1 text-sm">{a.check_out || "—"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[var(--ink-600)] text-center sm:text-left">
                Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of <span className="font-semibold">{meta.last_page}</span> · <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span> total
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
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="border-[var(--ink-300)]">
              <CardContent className="p-6 sm:p-8 text-center space-y-3">
                <CalendarDays className="size-10 mx-auto text-[var(--charge-500)]/40" />
                <div className="font-display font-semibold text-[var(--ink-900)]">History is the same list</div>
                <p className="text-sm text-[var(--ink-600)] max-w-[42ch] mx-auto">Use the date picker and search above — every record is kept. Switch back to <span className="font-medium text-[var(--ink-900)]">Today</span> for the front-desk view. For a full export, see <span className="font-mono text-xs bg-[var(--surface-0)] border border-[var(--ink-300)] px-1.5 py-0.5 rounded">/admin/reports</span>.</p>
                <Button variant="outline" className="mt-2 cursor-pointer" onClick={() => setTab("today")}>Back to Today</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
