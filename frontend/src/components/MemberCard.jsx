import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function MemberCard({ member }) {
  return (
    <Card className="overflow-hidden sm:hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div>
            <div className="font-mono text-xs text-muted-foreground">{member.member_code}</div>
            <div className="font-semibold">{member.first_name} {member.last_name}</div>
            <div className="text-xs text-muted-foreground">{member.email}</div>
          </div>
          <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1 min-h-9">View</Button>
          <Button variant="ghost" size="sm" className="flex-1 min-h-9">Edit</Button>
        </div>
      </CardContent>
    </Card>
  )
}
