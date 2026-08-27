import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dumbbell, Menu, TrendingUp, Users, CreditCard, Activity, Clock3 } from "lucide-react"

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <Dumbbell className="size-5" /> FitPay
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                <Button variant="ghost" className="justify-start gap-2"><TrendingUp className="size-4" /> Dashboard</Button>
                <Button variant="ghost" className="justify-start gap-2"><Users className="size-4" /> Members</Button>
                <Button variant="ghost" className="justify-start gap-2"><CreditCard className="size-4" /> Payments</Button>
                <Button variant="ghost" className="justify-start gap-2"><Activity className="size-4" /> Attendance</Button>
                <Button variant="ghost" className="justify-start gap-2"><Clock3 className="size-4" /> Reports</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">{children}</main>
    </div>
  )
}
