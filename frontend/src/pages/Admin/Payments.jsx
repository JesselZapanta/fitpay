import { useEffect, useState, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X, Filter, ChevronLeft, ChevronRight, CreditCard, CalendarDays, Receipt, DollarSign, User, Plus, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"

const planLabels = { daily: "Daily Pass", monthly: "Monthly Plan", yearly: "Yearly Plan" }
const planBadge = {
  daily: "bg-[#F0FDFA] text-[#0D9488] border-[#0D9488]/15",
  monthly: "bg-[#F5F3FF] text-[#7C3AED] border-[#7C3AED]/15",
  yearly: "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/15",
}

export default function AdminPayments() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [planType, setPlanType] = useState("all")
  const [month, setMonth] = useState("all")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      if (planType !== "all") params.plan_type = planType
      if (month !== "all") params.month = month
      const { data } = await api.get("/payments", { params })
      setPayments(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
    } catch { setPayments([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, planType, month])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  return (
    <AdminLayout title="Payments">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
                  <CreditCard className="size-7 text-[var(--charge-500)]" /> Payments
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)]">
                  Payments created from approved memberships · <span className="font-semibold text-[var(--charge-500)]">{meta.total}</span> total
                  {meta.total > 0 && (
                    <span className="hidden sm:inline"> · <span className="text-[var(--ink-900)] font-semibold">₱{totalAmount.toLocaleString()}</span> on this page</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-2">
                  <div className="size-8 rounded-lg bg-[var(--charge-500)] text-white inline-flex items-center justify-center">
                    <DollarSign className="size-4" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Total on page</div>
                    <div className="font-display font-bold text-sm text-[var(--ink-900)]">₱{totalAmount.toLocaleString()}</div>
                  </div>
                </div>
                <Button onClick={() => navigate("/admin/payments/create")} className="h-11 gap-1.5 bg-[var(--charge-500)] hover:bg-[var(--charge-600)] text-white font-semibold text-[14px] shadow-sm w-full sm:w-auto">
                  <Plus className="size-4" /> Add payment
                </Button>
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
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="size-4 text-[var(--ink-600)] hidden sm:block shrink-0" />
                <Select
                  value={planType}
                  onValueChange={(v) => {
                    setPlanType(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px] h-11 cursor-pointer">
                    <SelectValue placeholder="Plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All plans</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={month}
                  onValueChange={(v) => {
                    setMonth(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px] h-11 cursor-pointer">
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
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-600)]">
              <span>
                {meta.total > 0 ? (
                  <>Showing <span className="font-semibold text-[var(--ink-900)]">{meta.from}–{meta.to}</span> of <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span></>
                ) : "No results"}
                {debouncedSearch && <> for <span className="font-medium text-[var(--ink-900)]">"{debouncedSearch}"</span></>}
                {planType !== "all" && <> · <span className="capitalize text-[var(--charge-500)] font-medium">{planType}</span></>}
                {month !== "all" && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="capitalize text-[var(--charge-500)] font-medium">
                      {["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(month)]}
                    </span>
                  </>
                )}
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
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Membership</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Receipt className="size-8 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-medium">No payments yet</p>
                        <p className="text-xs text-[var(--ink-600)]">Approve a membership request at <span className="font-mono text-xs">/admin/membership-requests</span> to create a payment. Each approved request creates a payment with user_id, membership_id, amount.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-[var(--surface-0)]">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="size-8 rounded-full bg-[var(--charge-100)] border border-[var(--charge-500)]/15 inline-flex items-center justify-center text-[var(--charge-500)] shrink-0">
                              <User className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm leading-tight truncate max-w-[160px]">{p.user?.name || "—"}</div>
                              <div className="text-xs text-[var(--ink-600)] truncate max-w-[160px]">{p.user?.email || "—"}</div>
                              <div className="text-[11px] font-mono text-[var(--ink-600)]">user #{p.user_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono font-medium">#{p.membership_id}</div>
                          <div className="text-[11px] text-[var(--ink-600)]">membership_id</div>
                          {p.membership?.start_date && (
                            <div className="text-[11px] text-[var(--ink-600)] flex items-center gap-1 mt-0.5">
                              <CalendarDays className="size-3" /> {p.membership.start_date} → {p.membership.end_date}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[p.request?.plan_type] || planBadge.monthly}`}>
                            <CalendarDays className="size-3 mr-1" /> {p.request?.plan_label || planLabels[p.request?.plan_type] || "—"}
                          </Badge>
                          {p.request?.reference_number && <div className="text-[11px] font-mono text-[var(--ink-600)] mt-1">{p.request.reference_number}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-display font-bold text-sm tabular-nums">₱{Number(p.amount).toLocaleString()}</div>
                          <div className="text-[11px] text-[var(--ink-600)]">amount</div>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--ink-600)]">
                          <div className="font-medium text-[var(--ink-900)]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</div>
                          <div className="text-[11px]">{p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div>
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
          ) : payments.length === 0 ? (
            <Card className="border-dashed p-8 text-center">
              <Receipt className="size-8 mx-auto opacity-20 mb-2" />
              <p className="text-sm font-medium">No payments</p>
              <p className="text-xs text-[var(--ink-600)]">Approve a request to create one.</p>
            </Card>
          ) : (
            payments.map((p) => (
              <Card key={p.id} className="overflow-hidden border-[var(--ink-300)] shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm leading-tight">{p.user?.name || "—"}</div>
                      <div className="text-xs text-[var(--ink-600)] truncate">{p.user?.email || "—"}</div>
                      <div className="text-[11px] font-mono text-[var(--ink-600)]">user #{p.user_id} · membership #{p.membership_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-sm">₱{Number(p.amount).toLocaleString()}</div>
                      <div className="text-[11px] text-[var(--ink-600)]">amount</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[p.request?.plan_type] || planBadge.monthly}`}>
                      {p.request?.plan_label || "—"}
                    </Badge>
                    {p.request?.reference_number && <span className="text-xs font-mono bg-[var(--surface-0)] border border-[var(--ink-300)] rounded px-2 py-0.5">{p.request.reference_number}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs rounded-xl border border-[var(--ink-300)] bg-[var(--surface-0)] p-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Membership</div>
                      <div className="font-mono font-medium mt-0.5">#{p.membership_id}</div>
                      {p.membership?.start_date && <div className="text-[11px] text-[var(--ink-600)]">{p.membership.start_date} → {p.membership.end_date}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Date</div>
                      <div className="font-medium mt-0.5">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</div>
                      <div className="text-[11px] text-[var(--ink-600)]">{p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                    </div>
                  </div>
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
