import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Download, Users, ShieldCheck, Clock, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import AdminLayout from "@/components/Layout/Admin/AdminLayout"
import api from "@/lib/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const PER_PAGE = 15

const pad2 = (n) => String(n).padStart(2, "0")

function getCurrentMonthRange() {
  const manilaToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  const [year, month] = manilaToday.split("-").map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  return {
    start: `${year}-${pad2(month)}-01`,
    end: `${year}-${pad2(month)}-${pad2(daysInMonth)}`,
  }
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "no_plan", label: "No plan" },
]

function StatusPill({ status }) {
  const key = String(status || "").toLowerCase()
  const map = {
    active: "bg-[#DFF5E9] text-[#1E8E5A] border-[#1E8E5A]/20",
    expired: "bg-[#FBE2E2] text-[#C43D3D] border-[#C43D3D]/20",
    no_plan: "bg-[#EDEEF0] text-[#5B6168] border-[#5B6168]/20",
  }
  const labels = { active: "Active", expired: "Expired", no_plan: "No plan" }
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border whitespace-nowrap ${map[key] || map.no_plan}`}>
      {labels[key] || status || "—"}
    </Badge>
  )
}

const COLUMNS = [
  { header: "Member code", render: (r) => <span className="font-mono text-xs">{r.member_code}</span> },
  {
    header: "Member",
    render: (r) => (
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{r.name || "—"}</div>
        <div className="text-xs text-[var(--ink-600)] truncate">{r.email || "—"}</div>
      </div>
    ),
  },
  { header: "Phone", render: (r) => <span className="text-xs whitespace-nowrap">{r.phone || "—"}</span> },
  {
    header: "Period",
    render: (r) => (
      <span className="font-mono text-xs whitespace-nowrap">
        {r.start_date || "—"} → {r.end_date || "—"}
      </span>
    ),
  },
  { header: "Plan", render: (r) => <span className="text-xs whitespace-nowrap">{r.plan_label || "No plan"}</span> },
  { header: "Amount", render: (r) => <span className="font-semibold text-sm whitespace-nowrap">{r.amount ? `₱${Number(r.amount).toLocaleString()}` : "—"}</span> },
  { header: "Reference", render: (r) => <span className="font-mono text-xs">{r.reference_number || "—"}</span> },
  { header: "Status", render: (r) => <StatusPill status={r.status} /> },
]

function KpiGrid({ summary }) {
  const items = [
    { label: "Members", value: summary.total ?? 0, sub: "Members in report", icon: Users, chip: "bg-[var(--charge-100)] text-[var(--charge-500)]", bar: "bg-[var(--charge-500)]" },
    { label: "Active", value: summary.active ?? 0, sub: "Active memberships", icon: CheckCircle2, chip: "bg-[var(--grow-100)] text-[var(--grow-500)]", bar: "bg-[var(--grow-500)]" },
    { label: "Expired", value: summary.expired ?? 0, sub: "Expired memberships", icon: Clock, chip: "bg-[#FBE2E2] text-[#C43D3D]", bar: "bg-[#C43D3D]" },
    { label: "No plan", value: summary.no_plan ?? 0, sub: "Without membership", icon: ShieldCheck, chip: "bg-[#EDEEF0] text-[var(--ink-600)]", bar: "bg-[var(--ink-300)]" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="relative border-[var(--ink-300)] bg-white shadow-sm overflow-hidden">
            <div className={`absolute inset-y-0 left-0 w-1 ${item.bar}`} />
            <CardContent className="p-4 pl-5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">{item.label}</div>
                <span className={`size-7 rounded-lg inline-flex items-center justify-center shrink-0 ${item.chip}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-2 font-display font-bold text-[24px] sm:text-[26px] leading-none text-[var(--ink-900)] tabular-nums">{item.value}</div>
              <div className="mt-1.5 text-[11px] text-[var(--ink-600)] leading-snug">{item.sub}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TableCard({ count, data }) {
  return (
    <Card className="border-[var(--ink-300)] shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-[var(--charge-500)]" />
      <CardHeader className="px-4 sm:px-5 py-3 border-b border-[var(--ink-300)]/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-7 rounded-lg inline-flex items-center justify-center shrink-0 bg-[var(--charge-100)] text-[var(--charge-500)]">
              <Users className="size-4" />
            </span>
            <CardTitle className="font-display text-[15px] truncate">Members &amp; Memberships</CardTitle>
          </div>
          <Badge variant="outline" className="rounded-full border-[var(--ink-300)] text-[11px] font-semibold text-[var(--ink-600)] shrink-0">
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--surface-0)] hover:bg-[var(--surface-0)]">
                {COLUMNS.map((col) => (
                  <TableHead key={col.header} className="font-semibold text-[11px] uppercase tracking-wide text-[var(--ink-600)] whitespace-nowrap">{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? data.map((row, i) => (
                <TableRow key={row?.id ?? i} className="hover:bg-[var(--surface-0)]/70">
                  {COLUMNS.map((col) => (
                    <TableCell key={col.header} className="py-2.5 align-middle">
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} className="text-center py-10 text-sm text-[var(--ink-600)]">No records</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminReports() {
  const [mode, setMode] = useState("month") // month | all | custom
  const [from, setFrom] = useState(() => getCurrentMonthRange().start)
  const [to, setTo] = useState(() => getCurrentMonthRange().end)
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [summary, setSummary] = useState({})
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  const fetchReport = useCallback(async (overrides) => {
    const currentStatus = overrides?.status ?? status
    const currentPage = overrides?.page ?? page
    const currentFrom = overrides?.from ?? from
    const currentTo = overrides?.to ?? to
    setLoading(true)
    try {
      const params = { type: "members", page: currentPage, per_page: PER_PAGE }
      if (currentStatus !== "all") params.status = currentStatus
      if (currentFrom) params.from = currentFrom
      if (currentTo) params.to = currentTo
      const { data: res } = await api.get("/reports", { params })
      setSummary(res.summary || {})
      setRows(res.data || [])
      setMeta(res.meta || null)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report")
      setRows([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [status, page, from, to])

  useEffect(() => {
    fetchReport()
  }, [])

  const handleStatusChange = (value) => {
    setStatus(value)
    setPage(1)
    fetchReport({ status: value, page: 1 })
  }

  const handleThisMonth = () => {
    const range = getCurrentMonthRange()
    setMode("month")
    setFrom(range.start)
    setTo(range.end)
    setPage(1)
    fetchReport({ from: range.start, to: range.end, page: 1 })
  }

  const handleAllTime = () => {
    setMode("all")
    setFrom("")
    setTo("")
    setPage(1)
    fetchReport({ from: "", to: "", page: 1 })
  }

  const handleDateChange = (key, value) => {
    setMode("custom")
    const nextFrom = key === "from" ? value : from
    const nextTo = key === "to" ? value : to
    if (key === "from") setFrom(value)
    else setTo(value)
    if (nextFrom && nextTo && nextFrom > nextTo) {
      toast.error("From date must be before To date")
      return
    }
    setPage(1)
    fetchReport({ from: nextFrom, to: nextTo, page: 1 })
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    fetchReport({ page: nextPage })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = { type: "members", per_page: 5000 }
      if (status !== "all") params.status = status
      if (from) params.from = from
      if (to) params.to = to
      const { data: res } = await api.get("/reports", { params })
      const exportRows = res.data || []
      const exportSummary = res.summary || {}

      if (!exportRows.length) {
        toast.error("No data to export")
        return
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageW = doc.internal.pageSize.getWidth() // 297
      const pageH = doc.internal.pageSize.getHeight() // 210
      const margin = 12
      const contentW = pageW - margin * 2

      const teal = [15, 118, 110]
      const grow = [30, 142, 90]
      const amber = [184, 121, 10]
      const ink900 = [26, 29, 31]
      const ink600 = [91, 97, 104]
      const ink300 = [225, 228, 232]
      const surface = [247, 247, 245]
      const white = [255, 255, 255]

      const money = (n) => (n ? `PHP ${Number(n).toLocaleString()}` : "—")
      const statusLabel = status === "all" ? "All statuses" : STATUS_OPTIONS.find((o) => o.value === status)?.label || status
      const rangeLabel = mode === "all" ? "All time" : from && to ? `${from} to ${to}` : from ? `From ${from}` : to ? `Until ${to}` : "All time"
      const generated = new Date().toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })

      // Header band
      doc.setFillColor(...teal)
      doc.rect(0, 0, pageW, 28, "F")
      doc.setFillColor(...grow)
      doc.rect(0, 28, pageW, 1.2, "F")

      doc.setFillColor(...white)
      doc.roundedRect(margin, 8, 10, 10, 2, 2, "F")
      doc.setTextColor(...teal)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("F", margin + 5, 15.2, { align: "center" })

      doc.setTextColor(...white)
      doc.setFontSize(10)
      doc.text("FITPAY", margin + 13, 12)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.2)
      doc.setTextColor(210, 245, 240)
      doc.text("CHARGE AND GROW", margin + 13, 16)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(...white)
      doc.text("MEMBERS & MEMBERSHIPS REPORT", pageW - margin, 12, { align: "right" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.2)
      doc.setTextColor(210, 245, 240)
      doc.text(`Range: ${rangeLabel}  •  Status: ${statusLabel}`, pageW - margin, 16, { align: "right" })

      // Title
      doc.setTextColor(...ink900)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(17)
      doc.text("Members & Memberships", margin, 42)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.6)
      doc.setTextColor(...ink600)
      doc.text(`Range: ${rangeLabel}  •  Status: ${statusLabel}`, margin, 48.5)
      doc.text(`Generated: ${generated}`, pageW - margin, 48.5, { align: "right" })

      doc.setDrawColor(...ink300)
      doc.setLineWidth(0.2)
      doc.line(margin, 52, pageW - margin, 52)

      // Cards
      const cards = [
        { label: "MEMBERS", value: exportSummary.total ?? 0, sub: "Members in report", color: teal },
        { label: "ACTIVE", value: exportSummary.active ?? 0, sub: "Active memberships", color: grow },
        { label: "EXPIRED", value: exportSummary.expired ?? 0, sub: "Expired memberships", color: amber },
        { label: "NO PLAN", value: exportSummary.no_plan ?? 0, sub: "Without membership", color: [91, 97, 104] },
      ]
      const gap = 3
      const cardW = (contentW - gap * (cards.length - 1)) / cards.length
      const cardY = 57
      const cardH = 19

      cards.forEach((c, i) => {
        const x = margin + i * (cardW + gap)
        doc.setFillColor(...surface)
        doc.setDrawColor(...ink300)
        doc.setLineWidth(0.15)
        doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "FD")
        doc.setFillColor(...c.color)
        doc.roundedRect(x, cardY, 1.5, cardH, 0.75, 0.75, "F")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(6)
        doc.setTextColor(...ink600)
        doc.text(c.label, x + 4, cardY + 5)

        doc.setFontSize(13)
        doc.setTextColor(...ink900)
        doc.text(String(c.value), x + 4, cardY + 11.8)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(5.6)
        doc.setTextColor(...ink600)
        doc.text(doc.splitTextToSize(c.sub, cardW - 7)[0], x + 4, cardY + 16)
      })

      let cursorY = cardY + cardH + 8

      const drawSlimHeader = () => {
        doc.setFillColor(...teal)
        doc.rect(0, 0, pageW, 10, "F")
        doc.setTextColor(...white)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        doc.text("FitPay — Members & Memberships Report", margin, 6.4)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(6)
        doc.text(`${rangeLabel}  •  ${statusLabel}`, pageW - margin, 6.4, { align: "right" })
      }

      // Section heading
      doc.setFillColor(...teal)
      doc.roundedRect(margin, cursorY - 2.6, 2.6, 2.6, 0.6, 0.6, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(...ink900)
      doc.text("Members & Memberships", margin + 4.5, cursorY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...ink600)
      doc.text(`${exportRows.length} record${exportRows.length === 1 ? "" : "s"}`, pageW - margin, cursorY, { align: "right" })

      doc.setDrawColor(...ink300)
      doc.setLineWidth(0.2)
      doc.line(margin, cursorY + 1.6, pageW - margin, cursorY + 1.6)

      autoTable(doc, {
        startY: cursorY + 4.5,
        head: [["Member Code", "Member", "Phone", "Period", "Plan", "Amount", "Reference", "Status"]],
        body: exportRows.map((r) => [
          r.member_code || "—",
          r.name || "—",
          r.phone || "—",
          `${r.start_date || "—"} → ${r.end_date || "—"}`,
          r.plan_label || "No plan",
          money(r.amount),
          r.reference_number || "—",
          r.status === "no_plan" ? "No plan" : (r.status || "—"),
        ]),
        theme: "striped",
        showHead: "everyPage",
        margin: { top: 14, left: margin, right: margin, bottom: 14 },
        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: { top: 1.9, right: 1.8, bottom: 1.9, left: 1.8 },
          textColor: ink900,
          lineColor: ink300,
          lineWidth: { bottom: 0.1, top: 0, left: 0, right: 0 },
          overflow: "linebreak",
        },
        headStyles: { fillColor: teal, textColor: white, fontStyle: "bold", fontSize: 6.8, lineWidth: 0, halign: "left" },
        alternateRowStyles: { fillColor: surface },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 56 },
          2: { cellWidth: 26 },
          3: { cellWidth: 48 },
          4: { cellWidth: 30 },
          5: { cellWidth: 24, halign: "right" },
          6: { cellWidth: 45 },
          7: { cellWidth: 20, halign: "center" },
        },
        didParseCell: (hook) => {
          if (hook.column.index === 7 && hook.section === "body") {
            const raw = String(hook.cell.raw || "").toLowerCase()
            if (raw === "active") {
              hook.cell.styles.textColor = grow
              hook.cell.styles.fontStyle = "bold"
            } else if (raw === "expired") {
              hook.cell.styles.textColor = [196, 61, 61]
              hook.cell.styles.fontStyle = "bold"
            } else {
              hook.cell.styles.textColor = ink600
            }
          }
        },
        didDrawPage: (hook) => {
          if (hook.pageNumber > 1) drawSlimHeader()
        },
      })

      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setDrawColor(...ink300)
        doc.setLineWidth(0.2)
        doc.line(margin, pageH - 11, pageW - margin, pageH - 11)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(6.4)
        doc.setTextColor(...teal)
        doc.text("FITPAY", margin, pageH - 7)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(6)
        doc.setTextColor(...ink600)
        doc.text("Charge and Grow  •  Members & Memberships Report", margin + 11.5, pageH - 7)
        doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 7, { align: "right" })
      }

      doc.save(`fitpay-members-report-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success("PDF downloaded")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  const totalRecords = meta?.total ?? rows.length
  const statusLabel = status === "all" ? "All statuses" : STATUS_OPTIONS.find((o) => o.value === status)?.label || status
  const rangeLabel = mode === "all" ? "All time" : from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Until ${to}` : "All time"

  return (
    <AdminLayout title="Reports">
      <div className="space-y-4 sm:space-y-6">
        <Card className="relative border-0 shadow-sm overflow-hidden bg-gradient-to-br from-[var(--charge-500)] via-[var(--charge-600)] to-[var(--charge-500)]">
          <div className="absolute -right-10 -top-16 size-48 rounded-full bg-white/5" />
          <div className="absolute -right-2 -bottom-20 size-40 rounded-full bg-white/5" />
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-11 rounded-xl bg-white/15 backdrop-blur inline-flex items-center justify-center shrink-0">
                  <BarChart3 className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-tight">
                    Members &amp; Memberships
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 mt-1 break-words">
                    {rangeLabel} · {statusLabel} · {totalRecords} record{totalRecords === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting || !rows.length}
                className="h-11 flex-1 sm:flex-none gap-1.5 rounded-lg bg-white text-[var(--charge-600)] hover:bg-white/90 font-semibold shadow-sm"
              >
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {exporting ? "Exporting…" : "Export PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-300)] shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Range</span>
                <div className="inline-flex rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] p-0.5">
                  <button
                    type="button"
                    onClick={handleThisMonth}
                    className={`px-3 h-9 rounded-md text-[12px] font-medium cursor-pointer transition-colors ${mode === "month" ? "bg-[var(--charge-500)] text-white shadow-sm" : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"}`}
                  >
                    This month
                  </button>
                  <button
                    type="button"
                    onClick={handleAllTime}
                    className={`px-3 h-9 rounded-md text-[12px] font-medium cursor-pointer transition-colors ${mode === "all" ? "bg-[var(--charge-500)] text-white shadow-sm" : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"}`}
                  >
                    All time
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1.5">
                  <Label htmlFor="from" className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={from}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                    disabled={mode === "all"}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to" className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={to}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                    disabled={mode === "all"}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5 lg:w-[200px]">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Status</span>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-11 w-full cursor-pointer text-[13px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-[11px] text-[var(--ink-600)]">
              {mode === "all"
                ? "Showing all time — membership period is not filtered. Pick This month or set From/To to limit by period."
                : "Members are included when their latest membership period overlaps the selected range (start ≤ To, end ≥ From)."}
              {mode === "custom" && <span className="ml-1 font-medium text-[var(--charge-500)]">Custom range</span>}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">Showing</span>
          <Badge variant="outline" className="rounded-full border-[var(--ink-300)] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-900)]">Members &amp; Memberships</Badge>
          <Badge variant="outline" className="rounded-full border-[var(--ink-300)] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-900)]">
            {mode === "all" ? "All time" : from && to ? `${from} → ${to}` : "—"}
          </Badge>
          <Badge variant="outline" className="rounded-full border-[var(--ink-300)] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-900)]">{statusLabel}</Badge>
          <span className="ml-auto text-[11px] font-semibold text-[var(--ink-600)]">{totalRecords} record{totalRecords === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <KpiGrid summary={summary} />

            {rows.length === 0 && (
              <Card className="border-dashed border-[var(--ink-300)] bg-white">
                <CardContent className="p-8 text-center space-y-1">
                  <div className="mx-auto size-10 rounded-xl bg-[var(--surface-0)] border border-[var(--ink-300)] inline-flex items-center justify-center">
                    <BarChart3 className="size-5 text-[var(--ink-600)]" />
                  </div>
                  <div className="pt-2 text-sm font-semibold text-[var(--ink-900)]">No records found</div>
                  <div className="text-xs text-[var(--ink-600)] max-w-[46ch] mx-auto leading-relaxed">
                    {status === "all"
                      ? "There are no members yet."
                      : `No members with “${statusLabel.toLowerCase()}” membership. Try a different status.`}
                  </div>
                </CardContent>
              </Card>
            )}

            <TableCard count={rows.length} data={rows} />

            {meta && meta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[var(--ink-600)] text-center sm:text-left">
                  Page <span className="font-semibold text-[var(--ink-900)]">{meta.current_page}</span> of{" "}
                  <span className="font-semibold">{meta.last_page}</span> ·{" "}
                  <span className="font-semibold text-[var(--ink-900)]">{meta.total}</span> total
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={meta.current_page <= 1 || loading} onClick={() => handlePageChange(meta.current_page - 1)} className="min-h-11 cursor-pointer gap-1.5">
                    <ChevronLeft className="size-4" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page || loading} onClick={() => handlePageChange(meta.current_page + 1)} className="min-h-11 cursor-pointer gap-1.5">
                    Next <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
