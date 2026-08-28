import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dumbbell,
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  User,
  LogOut,
  Menu,
  Heart,
  Flame,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const memberNav = [
  { label: "Home", icon: LayoutDashboard, href: "/member" },
  { label: "Schedule", icon: CalendarCheck, href: "/member/schedule" },
  { label: "History", icon: Heart, href: "/member/history" },
  { label: "Billing", icon: CreditCard, href: "/member/billing" },
  { label: "Profile", icon: User, href: "/member/profile" },
]

export default function MemberLayout({ children, title = "My Dashboard" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-[#FCFCF9]">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--ink-300)] bg-white/90 backdrop-blur px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--grow-500)] text-white shadow-sm">
            <Dumbbell className="size-4" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-bold text-sm text-[var(--ink-900)]">FitPay</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-[var(--grow-500)] -mt-0.5">Member • Grow Stronger</div>
          </div>
          <Badge className="hidden md:inline-flex bg-[var(--grow-100)] text-[var(--grow-500)] border border-[var(--grow-500)]/20 hover:bg-[var(--grow-100)] text-[10px] ml-1">
            MEMBER
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--grow-100)] border border-[var(--grow-500)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--grow-500)]">
            <Flame className="size-3.5" /> 5-day streak
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-[var(--ink-300)] pl-2 ml-1">
            <Avatar className="size-8 border border-[var(--ink-300)]">
              <AvatarFallback className="bg-[var(--grow-500)] text-white text-xs font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block leading-tight text-left">
              <div className="text-xs font-bold text-[var(--ink-900)]">{user?.name}</div>
              <div className="text-[11px] text-[var(--ink-600)]">{user?.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex size-9 text-[var(--ink-600)] cursor-pointer" onClick={handleLogout}>
            <LogOut className="size-4" />
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="size-9 border-[var(--ink-300)] cursor-pointer">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display">
                  <Heart className="size-5 text-[var(--grow-500)]" /> Member Menu
                </SheetTitle>
                <SheetDescription className="text-left text-xs">Your personal gym space</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {memberNav.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium min-h-11 ${isActive(item.href) ? "bg-[var(--grow-500)] text-white" : "text-[var(--ink-900)] hover:bg-[var(--grow-100)]"}`}
                  >
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-[var(--ink-300)] pt-4">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-[var(--grow-500)] text-white">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-bold">{user?.name}</div>
                      <div className="text-xs text-[var(--ink-600)]">{user?.email}</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="mt-2 w-full justify-start gap-2 text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="size-4" /> Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-[220px] flex-col border-r border-[var(--ink-300)] bg-white overflow-hidden z-30">
          <div className="p-4">
            <div className="rounded-xl bg-gradient-to-br from-[var(--grow-500)] to-[#0F766E] p-4 text-white shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase opacity-90">
                <Trophy className="size-4" /> Your progress
              </div>
              <div className="mt-2 font-display text-xl font-bold">Keep it up!</div>
              <div className="text-xs opacity-80">12 check-ins this month</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-[68%] rounded-full bg-white" />
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {memberNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium min-h-11 transition-colors ${isActive(item.href) ? "bg-[var(--grow-500)] text-white shadow-sm" : "text-[var(--ink-900)] hover:bg-[var(--surface-0)]"}`}
              >
                <item.icon className="size-5" /> {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-[var(--ink-300)]">
            <div className="rounded-lg bg-[var(--surface-0)] border border-[var(--ink-300)] p-3 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-white border border-[var(--ink-300)] text-[var(--grow-500)]">
                <Heart className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[var(--ink-900)]">Need help?</div>
                <div className="text-[11px] text-[var(--ink-600)]">Ask front desk</div>
              </div>
            </div>
            <Button variant="ghost" className="mt-2 w-full justify-start gap-3 text-[var(--ink-600)] hover:text-[#C43D3D] hover:bg-[#FBE2E2] min-h-11 cursor-pointer" onClick={handleLogout}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 md:ml-[220px]">
          <div className="mx-auto max-w-[1100px] w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
            <div className="mb-4 sm:mb-6">
              <h1 className="font-display text-[20px] sm:text-[22px] font-semibold text-[var(--ink-900)]">{title}</h1>
              <p className="text-xs sm:text-sm text-[var(--ink-600)]">Member workspace • <span className="font-mono text-[11px] bg-[var(--grow-100)] px-1.5 py-0.5 rounded text-[var(--grow-500)]">role:member</span> • personal & motivational</p>
            </div>
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--ink-300)] bg-white">
        <div className="grid grid-cols-5 h-14">
          {memberNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} to={item.href} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${active ? "text-[var(--grow-500)] bg-[var(--grow-100)]" : "text-[var(--ink-600)]"}`}>
                <item.icon className="size-5" />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
