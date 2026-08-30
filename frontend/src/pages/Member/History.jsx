import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, CreditCard, Clock, CheckCircle2, XCircle, Receipt, ShieldCheck, Crown } from "lucide-react"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import api from "@/lib/api"

const planBadge = {
  daily: "bg-[#F0FDFA] text-[#0D9488] border-[#0D9488]/15",
  monthly: "bg-[#F5F3FF] text-[#7C3AED] border-[#7C3AED]/15",
  yearly: "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/15",
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    expired: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
    approved: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    pending: "bg-[#FEF3C7] text-[#B45309] border-[#B45309]/20",
    rejected: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
  }
  const icons = { active: CheckCircle2, expired: XCircle, approved: CheckCircle2, pending: Clock, rejected: XCircle }
  const Icon = icons[status] || Clock
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border gap-1 ${map[status] || "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20"}`}>
      <Icon className="size-3" /> {status}
    </Badge>
  )
}

export default function MemberHistory() {
  const [data, setData] = useState({ memberships: [], payments: [], requests: [] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("memberships")

  useEffect(() => {
    let mounted = true
    api
      .get("/member/history")
      .then((res) => {
        if (mounted) setData(res.data.data)
      })
      .catch(() => {
        if (mounted) setData({ memberships: [], payments: [], requests: [] })
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
      <MemberLayout title="History">
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </MemberLayout>
    )
  }

  const { memberships = [], payments = [], requests = [] } = data

  return (
    <MemberLayout title="History">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
            <Receipt className="size-7 text-[var(--charge-500)]" /> History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-600)]">Your membership and payment history — all in one place.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Memberships</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--ink-900)]">{memberships.length}</div>
              <div className="text-[11px] text-[var(--ink-600)]">records</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Payments</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--charge-500)]">{payments.length}</div>
              <div className="text-[11px] text-[var(--ink-600)]">paid</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Requests</div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[var(--ink-900)]">{requests.length}</div>
              <div className="text-[11px] text-[var(--ink-600)]">submitted</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11 rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-1">
            <TabsTrigger value="memberships" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer gap-1.5">
              <ShieldCheck className="size-4" /> Memberships
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer gap-1.5">
              <CreditCard className="size-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer gap-1.5">
              <Receipt className="size-4" /> Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memberships" className="mt-4">
            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Crown className="size-5 text-[var(--charge-500)]" /> Membership history
                </CardTitle>
                <CardDescription className="text-xs">Plans assigned after approved requests — start to end, with status.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--surface-0)]">
                        <TableHead className="font-semibold">Plan</TableHead>
                        <TableHead className="font-semibold">Period</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberships.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <ShieldCheck className="size-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm font-medium">No memberships yet</p>
                            <p className="text-xs text-[var(--ink-600)]">Approve a request to create one.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        memberships.map((m) => (
                          <TableRow key={m.id} className="hover:bg-[var(--surface-0)]">
                            <TableCell>
                              <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[m.plan_type] || planBadge.monthly}`}>
                                <CalendarDays className="size-3 mr-1" /> {m.plan_label}
                              </Badge>
                              <div className="text-[11px] font-mono text-[var(--ink-600)] mt-1">req #{m.request_id}</div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{m.start_date} → {m.end_date}</TableCell>
                            <TableCell className="font-semibold text-sm">₱{Number(m.amount || 0).toLocaleString()}</TableCell>
                            <TableCell><StatusBadge status={m.status} /></TableCell>
                            <TableCell className="font-mono text-xs">{m.reference_number || "—"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 sm:hidden p-3">
                  {memberships.length === 0 ? (
                    <div className="text-center py-6">
                      <ShieldCheck className="size-8 mx-auto opacity-20 mb-2" />
                      <p className="text-sm font-medium">No memberships</p>
                    </div>
                  ) : (
                    memberships.map((m) => (
                      <Card key={m.id} className="border-[var(--ink-300)] shadow-sm">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[m.plan_type] || planBadge.monthly}`}>{m.plan_label}</Badge>
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] p-3 flex items-center justify-between text-xs">
                            <span className="font-mono">{m.start_date}</span>
                            <span className="text-[var(--ink-600)]">→</span>
                            <span className="font-mono">{m.end_date}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--ink-600)]">Amount</span>
                            <span className="font-semibold">₱{Number(m.amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[var(--ink-600)]">ref {m.reference_number || "—"} · req #{m.request_id}</div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <CreditCard className="size-5 text-[var(--charge-500)]" /> Payment history
                </CardTitle>
                <CardDescription className="text-xs">Payments linked to memberships — user_id, membership_id, amount.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--surface-0)]">
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Membership</TableHead>
                        <TableHead className="font-semibold">Plan</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <CreditCard className="size-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm font-medium">No payments yet</p>
                            <p className="text-xs text-[var(--ink-600)]">Payments appear after approval.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono text-xs"># {p.id}</TableCell>
                            <TableCell className="font-mono text-xs">#{p.membership_id} <span className="text-[var(--ink-600)]">· req #{p.request_id}</span></TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[p.plan_type] || planBadge.monthly}`}>{p.plan_label}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">₱{Number(p.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-xs font-mono">{p.paid_at || (p.created_at ? new Date(p.created_at).toLocaleDateString() : "—")}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 sm:hidden p-3">
                  {payments.length === 0 ? (
                    <div className="text-center py-6">
                      <CreditCard className="size-8 mx-auto opacity-20 mb-2" />
                      <p className="text-sm font-medium">No payments</p>
                    </div>
                  ) : (
                    payments.map((p) => (
                      <Card key={p.id} className="border-[var(--ink-300)]">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs">Payment #{p.id}</span>
                            <span className="font-semibold text-sm">₱{Number(p.amount).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[p.plan_type] || planBadge.monthly}`}>{p.plan_label}</Badge>
                            <span className="text-[11px] font-mono text-[var(--ink-600)]">mem #{p.membership_id} · req #{p.request_id}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[var(--ink-600)]">{p.paid_at || (p.created_at ? new Date(p.created_at).toLocaleDateString() : "—")} · ref {p.reference_number || "—"}</div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Receipt className="size-5 text-[var(--charge-500)]" /> Request history
                </CardTitle>
                <CardDescription className="text-xs">All your membership requests — pending, approved, rejected.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--surface-0)]">
                        <TableHead className="font-semibold">Plan</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Reference</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <Receipt className="size-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm font-medium">No requests</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[r.plan_type] || planBadge.monthly}`}>{r.plan_label}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">₱{Number(r.amount).toLocaleString()}</TableCell>
                            <TableCell className="font-mono text-xs">{r.reference_number}</TableCell>
                            <TableCell><StatusBadge status={r.status} /></TableCell>
                            <TableCell className="text-xs font-mono">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 sm:hidden p-3">
                  {requests.length === 0 ? (
                    <div className="text-center py-6">
                      <Receipt className="size-8 mx-auto opacity-20 mb-2" />
                      <p className="text-sm font-medium">No requests</p>
                    </div>
                  ) : (
                    requests.map((r) => (
                      <Card key={r.id} className="border-[var(--ink-300)]">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${planBadge[r.plan_type] || planBadge.monthly}`}>{r.plan_label}</Badge>
                            <StatusBadge status={r.status} />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-mono text-xs">{r.reference_number}</span>
                            <span className="font-semibold">₱{Number(r.amount).toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[var(--ink-600)]">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</div>
                          {r.admin_note && <div className="text-xs bg-[var(--surface-0)] border border-[var(--ink-300)] rounded-lg px-3 py-2">Admin: {r.admin_note}</div>}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  )
}
