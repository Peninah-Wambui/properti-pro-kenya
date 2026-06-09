import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { getLeases, useStore } from "@/lib/data-store";
import { formatKES, formatDate, daysUntil, type Lease } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Mail, Phone, Search, Download, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/leases")({
  head: () => ({ meta: [{ title: "Leases & Tenants — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <LeasesPage />
    </RequireAuth>
  ),
});

function LeasesPage() {
  const leases = useStore(getLeases);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "ending_soon" | "expired">("all");
  const [selected, setSelected] = useState<Lease | null>(null);

  const filtered = useMemo(() => {
    let list = leases;
    if (filter !== "all") list = list.filter((l) => l.status === filter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.tenantName.toLowerCase().includes(s) ||
          l.unitLabel.toLowerCase().includes(s) ||
          l.propertyName.toLowerCase().includes(s),
      );
    }
    return list;
  }, [leases, search, filter]);

  const counts = {
    active: leases.filter((l) => l.status === "active").length,
    ending_soon: leases.filter((l) => l.status === "ending_soon").length,
    expired: leases.filter((l) => l.status === "expired").length,
  };
  const totalRent = leases.filter((l) => l.status !== "expired").reduce((a, b) => a + b.rent, 0);
  const totalDeposit = leases.reduce((a, b) => a + b.deposit, 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Leases & Tenants"
        subtitle={`${leases.length} tenants · ${formatKES(totalRent)} MRR · ${formatKES(totalDeposit)} held in deposits`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Active leases" value={counts.active} accent="success" />
        <Stat label="Ending in 60 days" value={counts.ending_soon} accent="warning" />
        <Stat label="Expired / unrenewed" value={counts.expired} accent="destructive" />
        <Stat label="Total deposits held" value={formatKES(totalDeposit)} accent="primary" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tenant, unit, or property" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {(["all", "active", "ending_soon", "expired"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "ending_soon" ? "Ending soon" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Tenant</th>
                <th className="text-left font-medium px-4 py-3">Unit · Property</th>
                <th className="text-right font-medium px-4 py-3">Rent / mo</th>
                <th className="text-right font-medium px-4 py-3">Deposit</th>
                <th className="text-left font-medium px-4 py-3">Term ends</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((l) => {
                const days = daysUntil(l.endDate);
                return (
                  <tr key={l.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelected(l)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {l.tenantName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{l.tenantName}</div>
                          <div className="text-xs text-muted-foreground">{l.tenantEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{l.unitLabel}</div>
                      <div className="text-xs">{l.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatKES(l.rent)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatKES(l.deposit)}</td>
                    <td className="px-4 py-3">
                      <div>{formatDate(l.endDate)}</div>
                      <div className={`text-xs ${days < 0 ? "text-destructive" : days <= 60 ? "text-warning-foreground" : "text-muted-foreground"}`}>
                        {days < 0 ? `${Math.abs(days)} days ago` : `${days} days left`}
                      </div>
                    </td>
                    <td className="px-4 py-3"><LeaseBadge status={l.status} /></td>
                    <td className="px-4 py-3 text-right text-xs text-primary">View →</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No leases match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.tenantName}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Detail label="Email" value={<span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{selected.tenantEmail}</span>} />
                <Detail label="Phone" value={<span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{selected.tenantPhone}</span>} />
                <Detail label="Unit" value={`${selected.unitLabel} · ${selected.propertyName}`} />
                <Detail label="Monthly rent" value={<span className="font-semibold text-foreground">{formatKES(selected.rent)}</span>} />
                <Detail label="Deposit held" value={formatKES(selected.deposit)} />
                <Detail label="Status" value={<LeaseBadge status={selected.status} />} />
                <Detail label="Lease start" value={formatDate(selected.startDate)} />
                <Detail label="Lease end" value={formatDate(selected.endDate)} />
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">Documents</p>
                <div className="space-y-2">
                  {selected.documents.map((d) => (
                    <div key={d.name} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{d.name}</span>
                        <span className="text-xs text-muted-foreground">{d.size}</span>
                      </div>
                      <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div className="mt-4 rounded-lg border-l-4 border-primary bg-primary/5 px-3 py-2 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Notes</p>
                  {selected.notes}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline">Send reminder</Button>
                <Button>Renew lease</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: "success" | "warning" | "destructive" | "primary" }) {
  const map = {
    success: { cls: "bg-success/10 text-success", icon: CheckCircle2 },
    warning: { cls: "bg-warning/15 text-warning-foreground", icon: AlertCircle },
    destructive: { cls: "bg-destructive/10 text-destructive", icon: AlertCircle },
    primary: { cls: "bg-primary/10 text-primary", icon: FileText },
  } as const;
  const { cls, icon: Icon } = map[accent];
  return (
    <div className="rounded-xl border bg-gradient-card p-4 shadow-soft">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function LeaseBadge({ status }: { status: Lease["status"] }) {
  const map = {
    active: { cls: "bg-success/10 text-success", label: "Active" },
    ending_soon: { cls: "bg-warning/15 text-warning-foreground", label: "Ending soon" },
    expired: { cls: "bg-destructive/10 text-destructive", label: "Expired" },
  } as const;
  const { cls, label } = map[status];
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide ${cls}`}>{label}</span>;
}
