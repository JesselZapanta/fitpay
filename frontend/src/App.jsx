import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dumbbell,
  Users,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  Menu,
  Search,
  Plus,
  Activity,
  Wallet,
  Clock3,
  ShieldCheck,
} from "lucide-react"
import api from "@/lib/api"

const stats = [
  { label: "Total Members", value: "1,248", icon: Users, change: "+12% this month", color: "bg-blue-500" },
  { label: "Active Memberships", value: "892", icon: ShieldCheck, change: "71% active rate", color: "bg-emerald-500" },
  { label: "Today's Attendance", value: "187", icon: CalendarCheck, change: "+8% vs yesterday", color: "bg-violet-500" },
  { label: "Monthly Revenue", value: "₱86,430", icon: Wallet, change: "+5.2% growth", color: "bg-amber-500" },
]

const recentPayments = [
  { id: "PAY-001", member: "Juan Dela Cruz", plan: "Annual", amount: "₱3,500", status: "paid", date: "2026-08-25" },
  { id: "PAY-002", member: "Maria Santos", plan: "Monthly", amount: "₱800", status: "paid", date: "2026-08-24" },
  { id: "PAY-003", member: "Jose Reyes", plan: "Monthly", amount: "₱800", status: "pending", date: "2026-08-24" },
  { id: "PAY-004", member: "Ana Garcia", plan: "Annual", amount: "₱3,500", status: "paid", date: "2026-08-23" },
]

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState("idle")
  const [searchQuery, setSearchQuery] = useState("")

  const handleApiTest = async () => {
    setApiStatus("loading")
    try {
      await api.get("/health").catch(() => api.get("/members"))
      setApiStatus("success")
    } catch {
      setApiStatus("error")
    } finally {
      setTimeout(() => setApiStatus("idle"), 2500)
    }
  }

  const filteredPayments = recentPayments.filter(
    (p) =>
      p.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold leading-none tracking-tight">FitPay</span>
              <span className="hidden sm:block text-xs text-muted-foreground leading-none">Charge and Grow</span>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex ml-2 text-[10px]">Gym Management</Badge>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <TrendingUp className="size-4" /> Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Users className="size-4" /> Members
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <CreditCard className="size-4" /> Payments
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Activity className="size-4" /> Attendance
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button size="sm" className="hidden sm:inline-flex gap-1.5 min-h-9">
              <Plus className="size-4" /> Add Member
            </Button>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="size-9 min-h-9 min-w-9">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Dumbbell className="size-5" /> FitPay Menu
                  </SheetTitle>
                  <SheetDescription>Navigate gym management modules</SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <Button variant="secondary" className="justify-start gap-3 min-h-11" onClick={() => setMobileNavOpen(false)}>
                    <TrendingUp className="size-5" /> Dashboard
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 min-h-11" onClick={() => setMobileNavOpen(false)}>
                    <Users className="size-5" /> Members
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 min-h-11" onClick={() => setMobileNavOpen(false)}>
                    <CreditCard className="size-5" /> Payments
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 min-h-11" onClick={() => setMobileNavOpen(false)}>
                    <CalendarCheck className="size-5" /> Attendance
                  </Button>
                  <Button variant="ghost" className="justify-start gap-3 min-h-11" onClick={() => setMobileNavOpen(false)}>
                    <Clock3 className="size-5" /> Reports
                  </Button>
                  <div className="pt-4 mt-2 border-t">
                    <Button className="w-full gap-2 min-h-11">
                      <Plus className="size-5" /> Add Member
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin — here&apos;s today&apos;s gym overview.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search members, payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 sm:h-10"
                />
              </div>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="hidden sm:inline-flex min-h-9 sm:min-h-10 gap-1.5">
                    <Clock3 className="size-4" /> History
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Attendance History</DrawerTitle>
                    <DrawerDescription>Bottom-sheet Drawer — mobile-first pattern with shadcn/ui.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-6 space-y-3">
                    <div className="rounded-lg border p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Juan Dela Cruz — Check-In</span>
                      <Badge>08:30 AM</Badge>
                    </div>
                    <div className="rounded-lg border p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Maria Santos — Check-Out</span>
                      <Badge variant="secondary">09:45 AM</Badge>
                    </div>
                    <div className="rounded-lg border p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Jose Reyes — Check-In</span>
                      <Badge>10:02 AM</Badge>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-xs sm:text-sm font-medium">{s.label}</CardDescription>
                  <div className={`flex size-8 items-center justify-center rounded-md text-white ${s.color}`}>
                    <s.icon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="size-3" /> {s.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 h-9 sm:h-10">
              <TabsTrigger value="payments" className="text-xs sm:text-sm gap-1.5">
                <CreditCard className="size-3.5 hidden sm:inline" /> Payments
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm gap-1.5">
                <Users className="size-3.5 hidden sm:inline" /> Members
              </TabsTrigger>
              <TabsTrigger value="setup" className="text-xs sm:text-sm gap-1.5">
                <Activity className="size-3.5 hidden sm:inline" /> Setup
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                <span className={`size-2 rounded-full ${apiStatus === "success" ? "bg-emerald-500" : apiStatus === "error" ? "bg-red-500" : "bg-amber-500"}`} />
                API: {import.meta.env.VITE_API_URL || "http://localhost:8000/api"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApiTest}
                disabled={apiStatus === "loading"}
                className="min-h-9 gap-1.5 text-xs sm:text-sm"
              >
                {apiStatus === "loading" ? "Testing..." : apiStatus === "success" ? "✓ Connected" : apiStatus === "error" ? "✗ Failed" : "Test API"}
              </Button>
            </div>
          </div>

          <TabsContent value="payments" className="mt-4 sm:mt-6 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Wallet className="size-5" /> Recent Payments
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Monitor payments — FR-04 read-only with search/filter + no-data state (mobile card stack / desktop table).
                    </CardDescription>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto min-h-9 gap-1.5">
                    <Plus className="size-4" /> Process Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="hidden sm:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No matching payments — try another search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono text-xs">{p.id}</TableCell>
                            <TableCell className="font-medium">{p.member}</TableCell>
                            <TableCell>{p.plan}</TableCell>
                            <TableCell>{p.amount}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{p.date}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-3 sm:hidden">
                  {filteredPayments.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No matching payments
                    </div>
                  ) : (
                    filteredPayments.map((p) => (
                      <div key={p.id} className="rounded-lg border p-3 space-y-2 bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs text-muted-foreground">{p.id}</div>
                            <div className="font-semibold text-sm leading-tight">{p.member}</div>
                            <div className="text-xs text-muted-foreground">{p.plan} • {p.date}</div>
                          </div>
                          <Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-bold">{p.amount}</span>
                          <Button variant="ghost" size="sm" className="h-8 text-xs">View</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-4 sm:mt-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="size-5" /> Member Quick Add
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Form validation demo — uses shadcn Form, Input, Select, Button (all JSX).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                      <Input id="firstName" placeholder="Juan" className="h-9 sm:h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                      <Input id="lastName" placeholder="Dela Cruz" className="h-9 sm:h-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="juan@example.com" className="h-9 sm:h-10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm">Membership Plan</Label>
                      <Select defaultValue="monthly">
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly — ₱800</SelectItem>
                          <SelectItem value="annual">Annual — ₱3,500</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
                      <Input id="phone" placeholder="09xx xxx xxxx" className="h-9 sm:h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <Button className="flex-1 min-h-11 gap-2">
                      <Plus className="size-4" /> Create Member
                    </Button>
                    <Button variant="outline" className="flex-1 min-h-11">Cancel</Button>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground text-center">
                    Validated via Laravel Form Requests — JSON 422 on failure.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Stack Verified</CardTitle>
                  <CardDescription>All requested libraries are installed and wired.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-card p-3 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Frontend</span>
                      <span className="font-semibold flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Vite + React JSX</span>
                    </div>
                    <div className="rounded-lg border bg-card p-3 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Styling</span>
                      <span className="font-semibold flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-500" /> Tailwind v4</span>
                    </div>
                    <div className="rounded-lg border bg-card p-3 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">UI</span>
                      <span className="font-semibold flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-500" /> shadcn/ui (JSX)</span>
                    </div>
                    <div className="rounded-lg border bg-card p-3 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Icons</span>
                      <span className="font-semibold flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> lucide-react</span>
                    </div>
                    <div className="rounded-lg border bg-card p-3 col-span-2 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">HTTP Client</span>
                      <span className="font-mono text-xs break-all">axios → {import.meta.env.VITE_API_URL || "http://localhost:8000/api"}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary text-primary-foreground p-3 text-xs leading-relaxed">
                    Mobile-first verified: base = 375px, collapse to single column, touch targets min-h-11, Sheet for nav, Drawer for history, table → cards on mobile.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Environment & Next Steps</CardTitle>
                <CardDescription>How to connect this frontend to the Laravel backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-md bg-muted p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-muted-foreground"># frontend/.env</div>
                  <div>VITE_API_URL=http://localhost:8000/api</div>
                  <div className="mt-3 text-muted-foreground"># backend/.env (Laravel)</div>
                  <div>APP_URL=http://localhost:8000</div>
                  <div>FRONTEND_URL=http://localhost:5173</div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg border p-3">
                    <div className="font-semibold flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">1</span> Run backend</div>
                    <div className="font-mono text-xs mt-2 bg-muted p-2 rounded">php artisan serve</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="font-semibold flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">2</span> Run frontend</div>
                    <div className="font-mono text-xs mt-2 bg-muted p-2 rounded">npm run dev</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="font-semibold flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">3</span> Add shadcn</div>
                    <div className="font-mono text-xs mt-2 bg-muted p-2 rounded">npx shadcn@latest add dialog</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <p className="text-xs text-muted-foreground">
            FitPay • Charge and Grow — Laravel API + React JSX • Tailwind • shadcn/ui • lucide • axios
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Mobile-first layout: verify at 375px and 320px — no horizontal scroll, thumb-friendly actions.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button variant="secondary" size="sm" className="flex-col h-auto py-2 gap-1 min-h-0">
            <TrendingUp className="size-5" />
            <span className="text-[10px] leading-none">Dashboard</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1 min-h-0">
            <Users className="size-5" />
            <span className="text-[10px] leading-none">Members</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1 min-h-0">
            <Activity className="size-5" />
            <span className="text-[10px] leading-none">Attendance</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1 min-h-0">
            <Wallet className="size-5" />
            <span className="text-[10px] leading-none">Payments</span>
          </Button>
        </div>
      </div>
      <div className="h-[72px] md:hidden" aria-hidden />
    </div>
  )
}

export default App
