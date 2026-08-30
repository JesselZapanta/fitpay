import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X, Filter, ChevronLeft, ChevronRight, Receipt, CheckCircle2, XCircle, Clock, Eye } from "lucide-react"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const planLabels = { daily: "Daily Pass", monthly: "Monthly Plan", yearly: "Yearly Plan" }

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

export default function MembershipRequestsIndex() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
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

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      if (status !== "all") params.status = status
      const { data } = await api.get("/membership-requests", { params })
      setRequests(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
    } catch { setRequests([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, status])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  return (
    <AdminLayout title="Membership Requests">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none">
                  Membership Requests
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)]">
                  <span className="font-semibold text-[var(--charge-500)]">{meta.total}</span> total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-300)] shadow-sm">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-600)]" />
                <Input placeholder="Search name, email, reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 pr-9 text-sm" />
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
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
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
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Receipt className="size-8 mx-auto opacity-30 mb-2" />
                        <p className="text-sm font-medium">No membership requests</p>
                        <p className="text-xs text-[var(--ink-600)]">No results for current filters.</p>
                        {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 cursor-pointer">Clear filters</Button>}
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((r) => (
                      <TableRow key={r.id} className="cursor-pointer hover:bg-[var(--surface-0)]" onClick={() => navigate(`/admin/membership-requests/${r.id}`)}>
                        <TableCell>
                          <div className="font-semibold text-sm">{r.user?.name || "—"}</div>
                          <div className="text-xs text-[var(--ink-600)]">{r.user?.email || "—"}</div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{planLabels[r.plan_type] || r.plan_type}</TableCell>
                        <TableCell className="font-semibold text-sm">₱{Number(r.amount).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs">{r.reference_number}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-xs text-[var(--ink-600)]">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="min-h-9 cursor-pointer gap-1" onClick={() => navigate(`/admin/membership-requests/${r.id}`)}>
                            <Eye className="size-3.5" /> View
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
          ) : requests.length === 0 ? (
            <Card className="border-dashed p-8 text-center">
              <Receipt className="size-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">No requests</p>
              <p className="text-xs text-[var(--ink-600)]">No results for current filters.</p>
              {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 cursor-pointer">Clear filters</Button>}
            </Card>
          ) : (
            requests.map((r) => (
              <Card key={r.id} className="overflow-hidden border-[var(--ink-300)] shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{r.user?.name || "—"}</div>
                      <div className="text-xs text-[var(--ink-600)]">{r.user?.email || "—"}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-[var(--ink-600)]">Plan</span> <span className="font-medium ml-1">{planLabels[r.plan_type] || r.plan_type}</span></div>
                    <div><span className="text-[var(--ink-600)]">Amount</span> <span className="font-semibold ml-1">₱{Number(r.amount).toLocaleString()}</span></div>
                    <div className="col-span-2"><span className="text-[var(--ink-600)]">Reference</span> <span className="font-mono ml-1">{r.reference_number}</span></div>
                  </div>
                  <div className="text-[11px] text-[var(--ink-600)]">{new Date(r.created_at).toLocaleDateString()}</div>
                  <Button size="sm" variant="outline" className="w-full min-h-11 cursor-pointer gap-1.5" onClick={() => navigate(`/admin/membership-requests/${r.id}`)}>
                    <Eye className="size-4" /> View Details
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
    </AdminLayout>
  )
}
