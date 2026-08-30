import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Layers,
  BarChart3,
  LogOut,
  Menu,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", roles: ["admin"] },
  { label: "Dashboard", icon: LayoutDashboard, href: "/member/dashboard", roles: ["member"] },
  { label: "Members", icon: Users, href: "/admin/members", roles: ["admin"] },
  { label: "Payments", icon: CreditCard, href: "/admin/payments", roles: ["admin"] },
  { label: "Attendance", icon: CalendarCheck, href: "/admin/attendance", roles: ["admin"] },
  { label: "Attendance", icon: CalendarCheck, href: "/member/schedule", roles: ["member"] },
  { label: "Memberships", icon: Layers, href: "/admin/memberships", roles: ["admin"] },
  { label: "Reports", icon: BarChart3, href: "/admin/reports", roles: ["admin"] },
]

export default function AppLayout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const filteredNav = navItems.filter((i) => !user || i.roles.includes(user.role))
  const bottomItems = filteredNav.slice(0, 4)

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + "/")

  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--ink-300)] bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--charge-500)] text-white">
            <Dumbbell className="size-4" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-semibold text-sm text-[var(--ink-900)]">FitPay</div>
            <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--charge-500)] -mt-1">Charge and Grow</div>
          </div>
          <span className="hidden md:inline-flex ml-2 rounded-full bg-[var(--charge-100)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--charge-500)]">
            {user?.role}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="hidden lg:block text-[var(--ink-600)]">{title}</span>
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-[var(--ink-300)] bg-[var(--surface-0)] px-3 py-2 text-[var(--ink-600)]">
              <Search className="size-4" />
              <span className="text-xs">Search members</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-[var(--ink-300)] pl-2 ml-1">
            <Avatar className="size-8 border border-[var(--ink-300)]">
              <AvatarFallback className="bg-[var(--charge-500)] text-white text-xs font-semibold">
                {user?.name?.slice(0, 2).toUpperCase() || "FP"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block leading-tight text-left">
              <div className="text-xs font-semibold text-[var(--ink-900)]">{user?.name}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{user?.email}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex size-9 text-[var(--ink-600)] hover:text-[var(--ink-900)]"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="size-9 border-[var(--ink-300)]">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display">
                  <Dumbbell className="size-5 text-[var(--charge-500)]" /> FitPay
                </SheetTitle>
                <SheetDescription className="text-left text-xs">Navigation — {user?.role}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {filteredNav.map((item) => (
                  <Link
                    key={item.label + item.href}
                    to={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-11 ${
                      isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--charge-100)]"
                    }`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-[var(--ink-300)] pt-4">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-[var(--ink-900)] text-white">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{user?.name}</div>
                      <div className="text-xs text-[var(--ink-600)]">{user?.email}</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="mt-2 w-full justify-start gap-2 text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11" onClick={handleLogout}>
                    <LogOut className="size-4" /> Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-[240px] flex-col border-r border-[var(--ink-300)] bg-white overflow-hidden z-30">
          <div className="p-3 space-y-6 flex-1 overflow-hidden">
            <div className="space-y-1">
              <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--ink-600)]">Overview</p>
              {filteredNav.slice(0, 1).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-11 ${
                    isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"
                  }`}
                >
                  <item.icon className="size-5" /> {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-1">
              <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--ink-600)]">Operations</p>
              {filteredNav.filter((i) => ["Members", "Attendance"].includes(i.label)).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-11 ${
                    isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"
                  }`}
                >
                  <item.icon className="size-5" /> {item.label}
                </Link>
              ))}
            </div>

            {filteredNav.some((i) => ["Payments", "Memberships"].includes(i.label)) && (
              <div className="space-y-1">
                <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--ink-600)]">Money</p>
                {filteredNav.filter((i) => ["Payments", "Memberships"].includes(i.label)).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-11 ${
                      isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"
                    }`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
              </div>
            )}

            {filteredNav.some((i) => i.label === "Reports") && (
              <div className="space-y-1">
                <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[var(--ink-600)]">Insights</p>
                {filteredNav.filter((i) => i.label === "Reports").map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-11 ${
                      isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"
                    }`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[var(--ink-300)]">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[var(--ink-600)] hover:text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11"
              onClick={handleLogout}
            >
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 md:ml-[240px]">
          <div className="mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--ink-300)] bg-white">
        <div className="grid grid-cols-5 h-14">
          {bottomItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium leading-none ${
                  active ? "text-[var(--charge-500)] bg-[var(--charge-100)]" : "text-[var(--ink-600)]"
                }`}
              >
                <item.icon className={`size-5 ${active ? "text-[var(--charge-500)]" : ""}`} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
              </Link>
            )
          })}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-[var(--ink-600)]">
                <MoreHorizontal className="size-5" />
                <span className="text-[10px]">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl bg-white">
              <SheetHeader>
                <SheetTitle className="font-display">More</SheetTitle>
                <SheetDescription>Additional modules</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {filteredNav.slice(4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 rounded-xl border border-[var(--ink-300)] p-4 hover:border-[var(--charge-500)] hover:bg-[var(--charge-100)]"
                  >
                    <item.icon className="size-5 text-[var(--charge-500)]" /> {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#FBE2E2] bg-[#FBE2E2] p-4 text-[#C43D3D] font-medium"
                >
                  <LogOut className="size-5" /> Log out — {user?.role}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
