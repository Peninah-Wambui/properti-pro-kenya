import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import {
  getMaintenance,
  updateMaintenanceStatus,
  assignMaintenanceVendor,
  getVendors,
  useStore,
} from "@/lib/data-store";
import { formatDate, formatKES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, AlertCircle, Clock, CheckCircle2, ImagePlus, Star } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <MaintenancePage />
    </RequireAuth>
  ),
});

// Demo cost map + photo for each ticket so the workflow feels real
const ticketMeta: Record<string, { cost?: number; photo?: string }> = {
  "m-1": { cost: 4500, photo: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=70" },
  "m-2": { cost: 18200, photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=70" },
  "m-3": { photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70" },
  "m-4": { cost: 2200, photo: "https://images.unsplash.com/photo-1573635042243-9bda04944cf2?w=400&q=70" },
};

function MaintenancePage() {
  const reqs = useStore(getMaintenance);
  const vendors = getVendors();
  const [filter, setFilter] = useState<"all" | "submitted" | "in_progress" | "completed">("all");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const counts = {
    submitted: reqs.filter((r) => r.status === "submitted").length,
    in_progress: reqs.filter((r) => r.status === "in_progress").length,
    completed: reqs.filter((r) => r.status === "completed").length,
  };

  const filtered = useMemo(
    () => (filter === "all" ? reqs : reqs.filter((r) => r.status === filter)),
    [reqs, filter],
  );

  const totalCost = reqs.reduce((a, b) => a + (ticketMeta[b.id]?.cost ?? 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader title="Maintenance" subtitle={`${reqs.length} tickets · ${formatKES(totalCost)} resolved costs to date`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card icon={AlertCircle} label="Submitted" value={counts.submitted} accent="destructive" />
        <Card icon={Clock} label="In progress" value={counts.in_progress} accent="warning" />
        <Card icon={CheckCircle2} label="Completed" value={counts.completed} accent="success" />
        <Card icon={Wrench} label="Spend (resolved)" value={formatKES(totalCost)} accent="primary" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "submitted", "in_progress", "completed"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card divide-y shadow-soft">
        {filtered.map((r) => {
          const meta = ticketMeta[r.id] ?? {};
          return (
            <div key={r.id} className="p-5 flex flex-wrap gap-4 items-start justify-between">
              <div className="flex gap-4 flex-1 min-w-0">
                {meta.photo ? (
                  <img src={meta.photo} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-border" />
                ) : (
                  <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${
                    r.priority === "high" ? "bg-destructive/10 text-destructive"
                    : r.priority === "medium" ? "bg-warning/15 text-warning-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    <Wrench className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.issue}</p>
                    <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${
                      r.priority === "high" ? "bg-destructive/10 text-destructive"
                      : r.priority === "medium" ? "bg-warning/15 text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}>{r.priority}</span>
                    {meta.cost !== undefined && (
                      <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">{formatKES(meta.cost)}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {r.tenantName} · {r.unitLabel}, {r.propertyName} · Submitted {formatDate(r.submittedAt)}
                    {r.assignedTo && <> · <span className="text-foreground font-medium">Vendor: {r.assignedTo}</span></>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusPill status={r.status} />
                {r.status !== "completed" && !r.assignedTo && (
                  <Button size="sm" variant="outline" onClick={() => setAssigning(r.id)}>Assign vendor</Button>
                )}
                {r.status === "submitted" && r.assignedTo && (
                  <Button size="sm" variant="outline" onClick={() => updateMaintenanceStatus(r.id, "in_progress")}>Start work</Button>
                )}
                {r.status === "in_progress" && (
                  <Button size="sm" onClick={() => setCompleting(r.id)}>Mark complete</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign vendor dialog */}
      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign a vendor</DialogTitle></DialogHeader>
          <div className="grid gap-2 mt-2">
            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  if (assigning) assignMaintenanceVendor(assigning, v.name);
                  setAssigning(null);
                }}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-sm">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.trade} · {v.phone}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-warning-foreground">
                  <Star className="h-3 w-3 fill-current" />{v.rating.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete dialog */}
      <Dialog open={!!completing} onOpenChange={(o) => !o && setCompleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close this ticket</DialogTitle></DialogHeader>
          <CompleteForm
            onDone={(cost) => {
              if (completing) {
                ticketMeta[completing] = { ...(ticketMeta[completing] ?? {}), cost };
                updateMaintenanceStatus(completing, "completed");
              }
              setCompleting(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompleteForm({ onDone }: { onDone: (cost: number) => void }) {
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onDone(Number(cost) || 0); }}
      className="space-y-3 mt-2"
    >
      <div className="space-y-1.5">
        <Label>Final cost (KES)</Label>
        <Input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Resolution notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Tap replaced and tested" />
      </div>
      <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <ImagePlus className="h-4 w-4" /> Attach photo (demo)
      </div>
      <DialogFooter>
        <Button type="submit">Close ticket</Button>
      </DialogFooter>
    </form>
  );
}

function Card({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; accent: "success" | "warning" | "destructive" | "primary" }) {
  const cls = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary",
  }[accent];
  return (
    <div className="rounded-xl border bg-gradient-card p-5 shadow-soft">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-4 text-xs text-muted-foreground uppercase font-medium tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "submitted" | "in_progress" | "completed" }) {
  const map = {
    submitted: { cls: "bg-destructive/10 text-destructive", label: "Submitted" },
    in_progress: { cls: "bg-warning/15 text-warning-foreground", label: "In progress" },
    completed: { cls: "bg-success/10 text-success", label: "Completed" },
  } as const;
  const { cls, label } = map[status];
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls}`}>{label}</span>;
}
