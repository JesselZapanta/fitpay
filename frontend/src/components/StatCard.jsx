import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"

export default function StatCard({ label, value, icon: Icon, change, color = "bg-primary" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{label}</CardDescription>
        <div className={`flex size-8 items-center justify-center rounded-md text-white ${color}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground mt-1">{change}</p>}
      </CardContent>
    </Card>
  )
}
