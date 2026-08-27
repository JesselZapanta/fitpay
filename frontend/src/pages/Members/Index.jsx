import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import MemberCard from "@/components/MemberCard"
import api from "@/lib/api"

export default function MembersIndex() {
  const [members, setMembers] = useState([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    api.get("/members", { params: { search: query } })
      .then((res) => setMembers(res.data.data || []))
      .catch(() => setMembers([]))
  }, [query])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Members</h1>
        <Button className="gap-2 min-h-11"><Plus className="size-4" /> Add Member</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search members..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-10" />
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
            ) : members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs">{m.member_code}</TableCell>
                <TableCell>{m.first_name} {m.last_name}</TableCell>
                <TableCell>{m.status}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 sm:hidden">
        {members.map((m) => <MemberCard key={m.id} member={m} />)}
        {members.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No members</div>}
      </div>
    </div>
  )
}
