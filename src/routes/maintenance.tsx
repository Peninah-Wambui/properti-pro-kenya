import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { getMaintenance, updateMaintenanceStatus, useStore } from "@/lib/data-store";
import { formatDate } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Wrench, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <MaintenancePage />
    </RequireAuth>
  ),
});

function MaintenancePage() {
  const reqs = useStore(getMaintenance);
  const counts = {
    submitted: reqs.filter((r) => r.status === "submitted").length,
    in_progress: reqs.filter((r) => r.status === "in_progress").length,
    completed: reqs.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader title="Maintenance" subtitle="Track and resolve tenant requests across your properties." />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card icon={AlertCircle} label="Submitted" value={counts.submitted} accent="destructive" />
        <Card icon={Clock} label="In progress" value={counts.in_progress} accent="warning" />
        <Card icon={CheckCircle2} label="Completed" value={counts.completed} accent="success" />
      </div>

      <div className="rounded-xl border bg-card divide-y shadow-soft">
        {reqs.map((r) => (
          <div key={r.id} className="p-5 flex flex-wrap gap-4 items-start justify-between">
            <div className="flex gap-4 flex-1 min-w-0">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                r.priority === "high" ? "bg-destructive/10 text-destructive"
                : r.priority === "medium" ? "bg-warning/15 text-warning-foreground"
                : "bg-muted text-muted-foreground"
              }`}>
                <Wrench className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.issue}</p>
                  <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${
                    r.priority === "high" ? "bg-destructive/10 text-destructive"
                    : r.priority === "medium" ? "bg-warning/15 text-warning-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>{r.priority}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {r.tenantName} · {r.unitLabel}, {r.propertyName} · Submitted {formatDate(r.submittedAt)}
                  {r.assignedTo && ` · Assigned to ${r.assignedTo}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={r.status} />
              {r.status === "submitted" && (
                <Button size="sm" variant="outline" onClick={() => updateMaintenanceStatus(r.id, "in_progress")}>Start</Button>
              )}
              {r.status === "in_progress" && (
                <Button size="sm" onClick={() => updateMaintenanceStatus(r.id, "completed")}>Complete</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent: "success" | "warning" | "destructive" }) {
  const cls = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
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
