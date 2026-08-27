import StatCard from "@/components/StatCard"
import { Users, ShieldCheck, CalendarCheck, Wallet } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value="1,248" icon={Users} change="+12% this month" color="bg-blue-500" />
        <StatCard label="Active Memberships" value="892" icon={ShieldCheck} change="71% active" color="bg-emerald-500" />
        <StatCard label="Today's Attendance" value="187" icon={CalendarCheck} change="+8% vs yesterday" color="bg-violet-500" />
        <StatCard label="Monthly Revenue" value="₱86,430" icon={Wallet} change="+5.2% growth" color="bg-amber-500" />
      </div>
    </div>
  )
}
