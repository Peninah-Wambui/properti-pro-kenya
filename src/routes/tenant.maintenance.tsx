import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/lib/auth-store";
import { addMaintenance, getMaintenance, useStore } from "@/lib/data-store";
import { formatDate } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Wrench, Plus } from "lucide-react";

export const Route = createFileRoute("/tenant/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Rentik" }] }),
  component: TenantMaintenance,
});

function TenantMaintenance() {
  const user = useCurrentUser();
  const reqs = useStore(getMaintenance);
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  if (!user) return null;
  const mine = reqs.filter((r) => r.tenantId === user.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const submit = () => {
    if (!issue.trim()) return;
    addMaintenance({
      tenantId: user.id,
      tenantName: user.name,
      unitLabel: "Unit " + (user.unitId?.split("-")[1] ?? "—"),
      propertyName: "My Property",
      issue,
      description: desc,
      priority,
    });
    setIssue(""); setDesc(""); setPriority("medium"); setOpen(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        title="Maintenance"
        subtitle="Report and track issues with your unit."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New request
          </Button>
        }
      />

      <div className="space-y-3">
        {mine.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{r.issue}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Submitted {formatDate(r.submittedAt)}{r.assignedTo ? ` · Assigned to ${r.assignedTo}` : ""}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                r.status === "completed" ? "bg-success/10 text-success"
                : r.status === "in_progress" ? "bg-warning/15 text-warning-foreground"
                : "bg-destructive/10 text-destructive"
              }`}>
                {r.status === "in_progress" ? "In progress" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
        {mine.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            No maintenance requests yet. Submit one above.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New maintenance request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="issue">Issue</Label>
              <Input id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g. Leaking tap in kitchen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Tell us more so we can fix it fast." />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Submit request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
