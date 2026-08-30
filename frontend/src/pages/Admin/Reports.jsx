import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Download, CalendarDays, Users, CreditCard, ShieldCheck, Clock } from "lucide-react"
import { toast } from "sonner"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function AdminReports() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({})
  const [data, setData] = useState({ members: [], memberships: [], payments: [], attendances: [] })

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (from) params.from = from
      if (to) params.to = to
      params.type = "general"
      const { data: res } = await api.get("/reports", { params })
      setSummary(res.summary || {})
      setData(res.data || { members: [], memberships: [], payments: [], attendances: [] })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchReport()
  }, [])

  const handleGenerate = () => {
    if (from && to && from > to) {
      toast.error("From date must be before To date")
      return
    }
    fetchReport()
  }

  const handleExport = () => {
    const hasData = data.members?.length || data.memberships?.length || data.payments?.length || data.attendances?.length
    if (!hasData) {
      toast.error("No data to export")
      return
    }
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    doc.setFillColor(15, 118, 110)
    doc.rect(0, 0, pageW, 28, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("FitPay — General Report", margin, 12)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("All admin modules in one view  •  Members  •  Memberships  •  Payments  •  Attendance", margin, 18)
    const range = from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Until ${to}` : "All time"
    doc.setFontSize(8)
    doc.text(`Range: ${range}  •  Generated: ${new Date().toLocaleString()}`, margin, 23)

    doc.setTextColor(40, 40, 40)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Summary", margin, 36)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const summaryLines = [
      `Members: ${summary.members_total ?? 0}  (Active ${summary.members_active ?? 0} • Expired ${summary.members_expired ?? 0})`,
      `Memberships: ${summary.memberships_total ?? 0}  (Active ${summary.memberships_active ?? 0} • Expired ${summary.memberships_expired ?? 0})`,
      `Payments: ${summary.payments_total ?? 0}  —  ₱${Number(summary.payments_revenue ?? 0).toLocaleString()} revenue`,
      `Attendance: ${summary.attendances_total ?? 0}  (Present ${summary.attendances_present ?? 0} • Done ${summary.attendances_completed ?? 0})`,
    ]
    summaryLines.forEach((line, i) => doc.text(line, margin, 42 + i * 5))

    let cursorY = 66

    const addSection = (title, head, body) => {
      if (!body.length) return
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(15, 118, 110)
      doc.text(title, margin, cursorY)
      cursorY += 2
      autoTable(doc, {
        startY: cursorY,
        head: [head],
        body,
        theme: "grid",
        headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8, halign: "left" },
        bodyStyles: { fontSize: 7, cellPadding: 2 },
        alternateRowStyles: { fillColor: [247, 247, 245] },
        margin: { left: margin, right: margin },
        styles: { lineColor: [225, 228, 232], lineWidth: 0.1 },
      })
      cursorY = doc.lastAutoTable.finalY + 8
      if (cursorY > 270) {
        doc.addPage()
        cursorY = 14
      }
    }

    addSection(
      "Members — recent 5",
      ["Code", "Member", "Status", "Created", "Plan"],
      (data.members || []).map((r) => [r.member_code || "—", r.name || "—", r.status || "—", r.created_at || "—", r.latest_plan_label || "No plan"])
    )
    addSection(
      "Memberships — recent 5",
      ["Member", "Plan", "Period", "Status"],
      (data.memberships || []).map((r) => [r.user_name || "—", r.plan_label || "—", r.period || `${r.start_date || "—"} → ${r.end_date || "—"}`, r.status || "—"])
    )
    addSection(
      "Payments — recent 5",
      ["User", "Plan", "Amount", "Date"],
      (data.payments || []).map((r) => [r.user_name || "—", r.plan_label || "—", `₱${Number(r.amount || 0).toLocaleString()}`, r.created_at || "—"])
    )
    addSection(
      "Attendance — recent 5",
      ["Member", "Date", "In", "Out", "Status"],
      (data.attendances || []).map((r) => [r.member_name || "—", r.attendance_date || "—", r.check_in || "—", r.check_out || "—", r.status || "—"])
    )

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(130, 130, 130)
      doc.text(`FitPay General Report  •  Page ${i} of ${pageCount}  •  ${new Date().toLocaleDateString()}`, margin, 287)
      doc.text("Charge and Grow", pageW - margin - 24, 287)
    }

    doc.save(`fitpay-general-report-${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF downloaded")
  }

  return (
    <AdminLayout title="Reports">
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
                  <BarChart3 className="size-7 text-[var(--charge-500)]" /> Reports
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)] mt-1.5">General report — all admin modules in one view.</p>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex rounded-full bg-[var(--charge-100)] text-[var(--charge-500)] border-[var(--charge-500)]/15 px-3 py-1 text-xs">General</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-300)] shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from" className="text-xs font-medium">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs font-medium">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11" />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleGenerate} disabled={loading} className="min-h-11 cursor-pointer bg-[var(--charge-500)] hover:bg-[var(--charge-600)] flex-1 gap-1.5">
                  {loading ? <Clock className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}
                  {loading ? "Generating…" : "Generate"}
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={loading || (!data.members?.length && !data.memberships?.length && !data.payments?.length && !data.attendances?.length)} className="min-h-11 cursor-pointer gap-1.5">
                  <Download className="size-4" /> Export PDF
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-[var(--ink-600)]">Leave dates empty for all time. One report covers members, memberships, payments and attendance.</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-[var(--ink-300)] bg-white">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]"><Users className="size-3.5" /> Members</div>
                  <div className="font-display font-bold text-2xl text-[var(--ink-900)]">{summary.members_total ?? 0}</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{summary.members_active ?? 0} active · {summary.members_expired ?? 0} expired</div>
                </CardContent>
              </Card>
              <Card className="border-[var(--ink-300)] bg-white">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]"><ShieldCheck className="size-3.5" /> Memberships</div>
                  <div className="font-display font-bold text-2xl text-[var(--ink-900)]">{summary.memberships_total ?? 0}</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{summary.memberships_active ?? 0} active · {summary.memberships_expired ?? 0} expired</div>
                </CardContent>
              </Card>
              <Card className="border-[var(--ink-300)] bg-white">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]"><CreditCard className="size-3.5" /> Payments</div>
                  <div className="font-display font-bold text-2xl text-[var(--ink-900)]">{summary.payments_total ?? 0}</div>
                  <div className="text-[11px] text-[var(--ink-600)]">₱{Number(summary.payments_revenue ?? 0).toLocaleString()} revenue</div>
                </CardContent>
              </Card>
              <Card className="border-[var(--ink-300)] bg-white">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]"><CalendarDays className="size-3.5" /> Attendance</div>
                  <div className="font-display font-bold text-2xl text-[var(--ink-900)]">{summary.attendances_total ?? 0}</div>
                  <div className="text-[11px] text-[var(--ink-600)]">{summary.attendances_present ?? 0} present · {summary.attendances_completed ?? 0} done</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base"><Users className="size-5 text-[var(--charge-500)]" /> Members — recent 5</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Code</TableHead><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Status</TableHead><TableHead className="font-semibold">Created</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.members?.length ? data.members.map((r, i) => (
                        <TableRow key={i}><TableCell className="font-mono text-xs">{r.member_code}</TableCell><TableCell><div className="font-medium text-sm">{r.name}</div><div className="text-xs text-[var(--ink-600)]">{r.email}</div></TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${r.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20"}`}>{r.status}</Badge></TableCell><TableCell className="font-mono text-xs">{r.created_at}</TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-[var(--ink-600)]">No members</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><ShieldCheck className="size-5 text-[var(--charge-500)]" /> Memberships — recent 5</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Plan</TableHead><TableHead className="font-semibold">Period</TableHead><TableHead className="font-semibold">Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.memberships?.length ? data.memberships.map((r, i) => (
                        <TableRow key={i}><TableCell><div className="font-medium text-sm">{r.user_name}</div><div className="text-xs text-[var(--ink-600)]">{r.user_email}</div></TableCell><TableCell className="text-xs">{r.plan_label}</TableCell><TableCell className="font-mono text-xs">{r.period}</TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${r.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20"}`}>{r.status}</Badge></TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-[var(--ink-600)]">No memberships</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><CreditCard className="size-5 text-[var(--charge-500)]" /> Payments — recent 5</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">User</TableHead><TableHead className="font-semibold">Plan</TableHead><TableHead className="font-semibold">Amount</TableHead><TableHead className="font-semibold">Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.payments?.length ? data.payments.map((r, i) => (
                        <TableRow key={i}><TableCell><div className="font-medium text-sm">{r.user_name}</div><div className="text-xs text-[var(--ink-600)]">{r.user_email}</div></TableCell><TableCell className="text-xs">{r.plan_label}</TableCell><TableCell className="font-semibold text-sm">₱{Number(r.amount).toLocaleString()}</TableCell><TableCell className="font-mono text-xs">{r.created_at}</TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-[var(--ink-600)]">No payments</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><CalendarDays className="size-5 text-[var(--charge-500)]" /> Attendance — recent 5</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="bg-[var(--surface-0)]"><TableHead className="font-semibold">Member</TableHead><TableHead className="font-semibold">Date</TableHead><TableHead className="font-semibold">In</TableHead><TableHead className="font-semibold">Out</TableHead><TableHead className="font-semibold">Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.attendances?.length ? data.attendances.map((r, i) => (
                        <TableRow key={i}><TableCell><div className="font-medium text-sm">{r.member_name}</div><div className="text-xs font-mono text-[var(--ink-600)]">{r.member_code}</div></TableCell><TableCell className="font-mono text-xs">{r.attendance_date}</TableCell><TableCell className="font-mono text-xs">{r.check_in || "—"}</TableCell><TableCell className="font-mono text-xs">{r.check_out || "—"}</TableCell><TableCell><Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${r.status === "completed" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FEF3C7] text-[#B45309] border-[#B45309]/20"}`}>{r.status}</Badge></TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-[var(--ink-600)]">No attendance</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
