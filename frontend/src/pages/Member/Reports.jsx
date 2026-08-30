import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Download, CalendarDays, CreditCard, ShieldCheck, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import MemberLayout from "@/components/Layout/Member/MemberLayout"
import api from "@/lib/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function MemberReports() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [summary, setSummary] = useState({})
  const [rawData, setRawData] = useState({ members: [], memberships: [], payments: [], attendances: [] })
  const [loading, setLoading] = useState(false)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (from) params.from = from
      if (to) params.to = to
      const { data: res } = await api.get("/member/reports", { params })
      setRawData(res.data || {})
      setSummary(res.summary || {})
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleExport = () => {
    const hasData = rawData.memberships?.length || rawData.payments?.length || rawData.attendances?.length
    if (!hasData) {
      toast.error("No data to export")
      return
    }
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14
    doc.setFillColor(30, 142, 90)
    doc.rect(0, 0, pageW, 28, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("FitPay — Member Report", margin, 12)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("Your personal history  •  Memberships  •  Payments  •  Attendance", margin, 18)
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
      `Memberships: ${summary.memberships_total ?? 0}  (Active ${summary.memberships_active ?? 0})`,
      `Payments: ${summary.payments_total ?? 0}  —  ₱${Number(summary.payments_revenue ?? 0).toLocaleString()} revenue`,
      `Attendance: ${summary.attendances_total ?? 0}  (Done ${summary.attendances_completed ?? 0})`,
    ]
    summaryLines.forEach((line, i) => doc.text(line, margin, 42 + i * 5))
    let cursorY = 62
    const addSection = (title, head, body) => {
      if (!body.length) return
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(30, 142, 90)
      doc.text(title, margin, cursorY)
      cursorY += 2
      autoTable(doc, {
        startY: cursorY,
        head: [head],
        body,
        theme: "grid",
        headStyles: { fillColor: [30, 142, 90], textColor: 255, fontSize: 8, halign: "left" },
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
    addSection("Memberships", ["Plan", "Period", "Status", "Amount"], (rawData.memberships || []).map((r) => [r.plan_label || "—", r.period || `${r.start_date || "—"} → ${r.end_date || "—"}`, r.status || "—", r.amount ? `₱${Number(r.amount).toLocaleString()}` : "—"]))
    addSection("Payments", ["Plan", "Amount", "Date"], (rawData.payments || []).map((r) => [r.plan_label || "—", r.amount ? `₱${Number(r.amount).toLocaleString()}` : "—", r.created_at || "—"]))
    addSection("Attendance", ["Date", "In", "Out", "Status"], (rawData.attendances || []).map((r) => [r.attendance_date || "—", r.check_in || "—", r.check_out || "—", r.status || "—"]))
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(130, 130, 130)
      doc.text(`FitPay Member Report  •  Page ${i} of ${pageCount}  •  ${new Date().toLocaleDateString()}`, margin, 287)
      doc.text("Grow Stronger", pageW - margin - 22, 287)
    }
    doc.save(`fitpay-member-report-${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF downloaded")
  }

  return (
    <MemberLayout title="Reports">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-[22px] sm:text-[28px] font-semibold tracking-tight text-[var(--ink-900)] leading-none flex items-center gap-2.5">
            <BarChart3 className="size-7 text-[var(--grow-500)]" /> Reports
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-600)]">Your personal reports — memberships, payments and attendance.</p>
        </div>

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
                <Button onClick={fetchReport} disabled={loading} className="min-h-11 cursor-pointer bg-[var(--grow-500)] hover:bg-[#0F766E] flex-1 gap-1.5">
                  {loading ? <Clock className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}
                  Generate
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={loading} className="min-h-11 cursor-pointer gap-1.5">
                  <Download className="size-4" /> Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Memberships</div>
              <div className="font-display font-bold text-xl text-[var(--ink-900)]">{summary.memberships_total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{summary.memberships_active ?? 0} active</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Payments</div>
              <div className="font-display font-bold text-xl text-[var(--ink-900)]">{summary.payments_total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">₱{Number(summary.payments_revenue ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Attendance</div>
              <div className="font-display font-bold text-xl text-[var(--ink-900)]">{summary.attendances_total ?? 0}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{summary.attendances_completed ?? 0} done</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-[var(--ink-300)] shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><ShieldCheck className="size-5 text-[var(--charge-500)]" /> Memberships</CardTitle><CardDescription className="text-xs">Recent 5</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {rawData.memberships?.length ? rawData.memberships.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-2">
                  <span className="text-sm font-medium">{m.plan_label}</span>
                  <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] border ${m.status === "active" ? "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20" : "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20"}`}>{m.status}</Badge>
                </div>
              )) : <p className="text-xs text-[var(--ink-600)] text-center py-4">No memberships</p>}
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><CreditCard className="size-5 text-[var(--charge-500)]" /> Payments</CardTitle><CardDescription className="text-xs">Recent 5</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {rawData.payments?.length ? rawData.payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-2">
                  <span className="text-sm font-medium">{p.plan_label}</span>
                  <span className="text-sm font-semibold">₱{Number(p.amount).toLocaleString()}</span>
                </div>
              )) : <p className="text-xs text-[var(--ink-600)] text-center py-4">No payments</p>}
            </CardContent>
          </Card>
          <Card className="border-[var(--ink-300)] shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 font-display text-base"><CalendarDays className="size-5 text-[var(--charge-500)]" /> Attendance</CardTitle><CardDescription className="text-xs">Recent 5</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {rawData.attendances?.length ? rawData.attendances.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-2">
                  <span className="font-mono text-xs">{a.attendance_date}</span>
                  <span className="text-xs font-medium">{a.check_in || "—"} → {a.check_out || "—"}</span>
                </div>
              )) : <p className="text-xs text-[var(--ink-600)] text-center py-4">No attendance</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </MemberLayout>
  )
}
