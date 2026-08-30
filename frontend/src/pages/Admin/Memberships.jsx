import { useEffect, useState, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X, Filter, ChevronLeft, ChevronRight, Crown, CalendarDays, ShieldCheck, Clock, CheckCircle2, XCircle, Pencil, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
]

const planLabels = { daily: "Daily Pass", monthly: "Monthly Plan", yearly: "Yearly Plan" }
const planBadge = {
  daily: "bg-[#F0FDFA] text-[#0D9488] border-[#0D9488]/15",
  monthly: "bg-[#F5F3FF] text-[#7C3AED] border-[#7C3AED]/15",
  yearly: "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/15",
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    expired: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
  }
  const icons = { active: CheckCircle2, expired: XCircle }
  const Icon = icons[status] || Clock
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border gap-1 ${map[status] || map.active}`}>
      <Icon className="size-3" /> {status}
    </Badge>
  )
}

export default function AdminMemberships() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const debounceRef = useRef(null)

  const hasFilters = search || status !== "all"
  const clearFilters = () => { setSearch(""); setStatus("all"); setPage(1) }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const fetchMemberships = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      if (status !== "all") params.status = status
      const { data } = await api.get("/memberships", { params })
      setMemberships(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
    } catch { setMemberships([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, status])

  useEffect(() => { fetchMemberships() }, [fetchMemberships])

  const activeCount = memberships.filter((m) => m.status === "active").length
  const expiredCount = memberships.filter((m) => m.status === "expired").length

  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState({ status: "active" })
  const [saving, setSaving] = useState(false)

  const openEdit = (m) => {
    setSelected(m)
    setEditForm({ status: m.raw_status || m.status })
    setEditOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      await api.put(`/memberships/${selected.id}`, { status: editForm.status })
      toast.success("Membership updated.")
      setEditOpen(false)
      setSelected(null)
      fetchMemberships()
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update membership."
      toast.error(msg)
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]?.[0]
        if (first) toast.error(first)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Memberships">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
                  <Crown className="size-7 text-[var(--charge-500)]" /> Memberships
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)]">
                  Active memberships created from approved payments · <span className="font-semibold text-[var(--charge-500)]">{meta.total}</span> total
                  {meta.total > 0 && (
                    <span className="hidden sm:inline"> · <span className="text-[#1E8E5A] font-medium">{activeCount} active</span> · <span className="text-[#C43D3D] font-medium">{expiredCount} expired</span></span>
                  )}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--ink-600)]">
                <span className="size-2 rounded-full bg-[#1E8E5A]" /> Active
                <span className="size-2 rounded-full bg-[#C43D3D] ml-2" /> Expired
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-300)] shadow-sm">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                <Input placeholder="Search name, email, reference, plan…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 pr-9 text-sm" />
                {search ? (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--surface-0)] border border-transparent hover:border-[var(--ink-300)] cursor-pointer" aria-label="Clear search">
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
                  <Button variant="outline" onClick={clearFilters} className="h-11 cursor-pointer whitespace-nowrap shrink-0">Clear</Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-600)]">
              <span>
                {meta.total > 0 ? (
                  <>Showing <span className="font-semibold text-[var(--ink-900)]">{meta.from}–{meta.to}</span> of <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span></>
                ) : "No results"}
                {debouncedSearch && <> for <span className="font-medium text-[var(--ink-900)]">"{debouncedSearch}"</span></>}
                {status !== "all" && <> · <span className="capitalize">{status}</span></>}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of {meta.last_page}
              </span>
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
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Start</TableHead>
                    <TableHead className="font-semibold">End</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Request</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : memberships.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <ShieldCheck className="size-8 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-medium">No memberships</p>
                        <p className="text-xs text-[var(--ink-600)]">Approve a membership request to create one. Requests live at <span className="font-mono text-xs">/admin/membership-requests</span>.</p>
                        {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 cursor-pointer">Clear filters</Button>}
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberships.map((m) => (
                      <TableRow key={m.id} className="hover:bg-[var(--surface-0)]">
                        <TableCell>
                          <div className="font-semibold text-sm leading-tight">{m.user?.name || "—"}</div>
                          <div className="text-xs text-[var(--ink-600)]">{m.user?.email || "—"}</div>
                          <div className="text-[11px] font-mono text-[var(--ink-600)]">user #{m.user_id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[m.request?.plan_type] || planBadge.monthly}`}>
                            <CalendarDays className="size-3 mr-1" /> {m.request?.plan_label || planLabels[m.request?.plan_type] || "—"}
                          </Badge>
                          {m.request?.amount && <div className="text-xs font-semibold mt-1">₱{Number(m.request.amount).toLocaleString()}</div>}
                        </TableCell>
                        <TableCell className="text-sm font-mono">{m.start_date}</TableCell>
                        <TableCell className="text-sm font-mono">{m.end_date}</TableCell>
                        <TableCell><StatusBadge status={m.status} /></TableCell>
                        <TableCell className="text-xs">
                          <div className="font-mono">#{m.request_id}</div>
                          <div className="text-[11px] text-[var(--ink-600)]">{m.request?.reference_number || "—"}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(m)} aria-label="Edit status">
                            <Pencil className="size-4" />
                          </Button>
                        </TableCell>
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
          ) : memberships.length === 0 ? (
            <Card className="border-dashed p-8 text-center">
              <ShieldCheck className="size-8 mx-auto opacity-20 mb-2" />
              <p className="text-sm font-medium">No memberships</p>
              <p className="text-xs text-[var(--ink-600)]">Approve a request to create one.</p>
              {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 cursor-pointer">Clear filters</Button>}
            </Card>
          ) : (
            memberships.map((m) => (
              <Card key={m.id} className="overflow-hidden border-[var(--ink-300)] shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm leading-tight">{m.user?.name || "—"}</div>
                      <div className="text-xs text-[var(--ink-600)] truncate">{m.user?.email || "—"}</div>
                      <div className="text-[11px] font-mono text-[var(--ink-600)]">user #{m.user_id} · req #{m.request_id}</div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[m.request?.plan_type] || planBadge.monthly}`}>
                      {m.request?.plan_label || "—"}
                    </Badge>
                    {m.request?.reference_number && <span className="text-xs font-mono bg-[var(--surface-0)] border border-[var(--ink-300)] rounded px-2 py-0.5">{m.request.reference_number}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1"><CalendarDays className="size-3" /> Start</div>
                      <div className="font-mono font-medium mt-0.5">{m.start_date}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)] flex items-center gap-1"><CalendarDays className="size-3" /> End</div>
                      <div className="font-mono font-medium mt-0.5">{m.end_date}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full min-h-11 cursor-pointer gap-1.5" onClick={() => openEdit(m)}>
                    <Pencil className="size-4" /> Edit status
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--ink-600)] text-center sm:text-left">
            Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of{" "}
            <span className="font-semibold">{meta.last_page}</span> · <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span> total
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
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white p-0 gap-0 max-h-[92vh] overflow-y-auto">
          <DialogHeader className="px-5 sm:px-6 pt-5 pb-4 border-b border-[var(--ink-300)] text-left">
            <DialogTitle className="font-display flex items-center gap-2 text-base">
              <span className="size-8 rounded-lg bg-[var(--charge-100)] border border-[var(--charge-500)]/15 inline-flex items-center justify-center">
                <Pencil className="size-4 text-[var(--charge-500)]" />
              </span>
              Edit membership
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--ink-600)]">
              {selected?.user?.name || "—"} · {selected?.request?.plan_label || "—"} · user #{selected?.user_id} · req #{selected?.request_id}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="px-5 sm:px-6 py-4 space-y-4">
            <div className="rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Member</div>
                <div className="text-sm font-semibold">{selected?.user?.name || "—"}</div>
                <div className="text-xs text-[var(--ink-600)]">{selected?.user?.email || "—"}</div>
              </div>
              <StatusBadge status={editForm.status} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ status: v })}>
                <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[var(--ink-600)]">Active = member can check in. Expired = needs renewal.</p>
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={saving} className="min-h-11 cursor-pointer flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-h-11 cursor-pointer bg-[var(--charge-500)] hover:bg-[var(--charge-600)] flex-1 sm:flex-none min-w-[132px] gap-1.5">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
