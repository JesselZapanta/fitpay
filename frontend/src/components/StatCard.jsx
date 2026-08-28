import { Card, CardContent } from "@/components/ui/card"

export default function StatCard({ label, value, icon: Icon, trend, tone = "charge" }) {
  const toneMap = {
    charge: "bg-[var(--charge-500)] text-white",
    grow: "bg-[var(--grow-500)] text-white",
    neutral: "bg-[var(--ink-900)] text-white",
    warning: "bg-[#B8790A] text-white",
  }

  return (
    <Card className="rounded-xl border-[var(--ink-300)] bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-[var(--ink-600)] leading-none">{label}</p>
            <p className="font-display text-[22px] sm:text-[28px] font-bold leading-none tabular-nums text-[var(--ink-900)]">{value}</p>
            {trend && (
              <p className="text-xs font-medium text-[var(--grow-500)] flex items-center gap-1">
                <span className="inline-flex size-1.5 rounded-full bg-[var(--grow-500)]" /> {trend}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.charge}`}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
