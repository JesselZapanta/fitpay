import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Receipt,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", group: "Overview" },
  { label: "Members", icon: Users, href: "/admin/members", group: "Operations" },
  { label: "Requests", icon: Receipt, href: "/admin/membership-requests", group: "Operations" },
  { label: "Attendance", icon: CalendarCheck, href: "/admin/attendance", group: "Operations" },
  { label: "Payments", icon: CreditCard, href: "/admin/payments", group: "Money" },
  { label: "Memberships", icon: Layers, href: "/admin/memberships", group: "Money" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports", group: "Insights" },
]

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

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const photoUrl = resolvePhotoUrl(user?.photo, user?.photo_url)
  const initials = (user?.name || "FitPay Admin").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const isActive = (href) => {
    const path = location.pathname
    if (path === href) return true
    if (href === "/admin/dashboard") return path === href
    return path.startsWith(href + "/")
  }
  const grouped = adminNav.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of FitPay?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page. Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-[#C43D3D] hover:bg-[#A33232] text-white cursor-pointer">
              <LogOut className="size-4 mr-1.5" /> Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--ink-300)] bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--charge-500)] text-white shadow-sm">
            <Dumbbell className="size-4" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-bold text-sm text-[var(--ink-900)]">FitPay</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-[var(--charge-500)] -mt-0.5">Admin • Charge and Grow</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/profile"
            className="hidden sm:flex items-center gap-3 rounded-lg px-3 py-2 bg-[var(--surface-0)] border border-[var(--ink-300)] hover:border-[var(--charge-500)]/30 hover:bg-white transition-colors cursor-pointer"
            title="Go to profile — email is read-only"
          >
            <Avatar className="size-7 border border-[var(--ink-300)] shrink-0">
              {photoUrl ? <AvatarImage src={photoUrl} alt={user?.name} className="object-cover" /> : null}
              <AvatarFallback className="bg-[var(--charge-500)] text-white text-[10px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left leading-tight min-w-0">
              <div className="text-xs font-bold text-[var(--ink-900)] leading-none truncate max-w-[140px]">{user?.name || "FitPay Admin"}</div>
              <div className="text-[11px] text-[var(--ink-600)] leading-none truncate max-w-[140px]">{user?.email || "admin@fitpay.test"}</div>
            </div>
          </Link>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="size-9 border-[var(--ink-300)] cursor-pointer">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display">
                  <Dumbbell className="size-5 text-[var(--charge-500)]" /> Admin Menu
                </SheetTitle>
                <SheetDescription className="text-left text-xs">Manage gym operations</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {adminNav.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium min-h-11 ${isActive(item.href) ? "bg-[var(--charge-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--charge-100)]"}`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-[var(--ink-300)] pt-4">
                  <Button variant="ghost" className="w-full justify-start gap-2 text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11 cursor-pointer" onClick={() => { setSheetOpen(false); setLogoutOpen(true) }}>
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
          <div className="p-3 space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <p className="px-3 py-2 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-600)]">{group}</p>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-11 transition-colors ${isActive(item.href) ? "bg-[var(--charge-500)] text-white shadow-sm" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"}`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--ink-300)] space-y-2">
            <Link
              to="/admin/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-3 bg-[var(--surface-0)] border border-[var(--ink-300)] hover:border-[var(--charge-500)]/30 hover:bg-white transition-colors cursor-pointer"
              title="Go to profile — email is read-only"
            >
              <Avatar className="size-8 border border-[var(--ink-300)] shrink-0">
                {photoUrl ? <AvatarImage src={photoUrl} alt={user?.name} className="object-cover" /> : null}
                <AvatarFallback className="bg-[var(--charge-500)] text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-[var(--ink-900)] truncate">{user?.name || "FitPay Admin"}</div>
                <div className="text-[11px] text-[var(--ink-600)] truncate">{user?.email || "admin@fitpay.test"}</div>
              </div>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3 text-[var(--ink-600)] hover:text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11 cursor-pointer" onClick={() => setLogoutOpen(true)}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 md:ml-[240px]">
          <div className="mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
            {title !== "Profile" && title !== "Members" && title !== "Membership Requests" && title !== "Request Details" && (
              <div className="mb-4 sm:mb-6 hidden sm:block">
                <h1 className="font-display text-[20px] sm:text-[22px] font-semibold text-[var(--ink-900)]">{title}</h1>
                <p className="text-xs sm:text-sm text-[var(--ink-600)]">Admin workspace</p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--ink-300)] bg-white">
        <div className="grid grid-cols-5 h-14">
          {adminNav.slice(0, 4).map((item) => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} to={item.href} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${active ? "text-[var(--charge-500)] bg-[var(--charge-100)]" : "text-[var(--ink-600)]"}`}>
                <item.icon className="size-5" />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            )
          })}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-[var(--ink-600)] cursor-pointer">
                <Menu className="size-5" />
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl bg-white">
              <SheetHeader>
                <SheetTitle className="font-display">More</SheetTitle>
                <SheetDescription>Admin modules</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {adminNav.slice(4).map((item) => (
                  <Link key={item.href} to={item.href} className="flex items-center gap-3 rounded-xl border border-[var(--ink-300)] p-4 hover:border-[var(--charge-500)] hover:bg-[var(--charge-100)]">
                    <item.icon className="size-5 text-[var(--charge-500)]" /> {item.label}
                  </Link>
                ))}
                <button onClick={() => setLogoutOpen(true)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#FBE2E2] bg-[#FBE2E2] p-4 text-[#C43D3D] font-medium cursor-pointer">
                  <LogOut className="size-5" /> Log out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
