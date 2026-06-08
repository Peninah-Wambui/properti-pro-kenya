import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { PROPERTIES, formatKES, formatDate, daysUntil, type PaymentStatus } from "@/lib/mock-data";
import { getRents, payRent, useStore } from "@/lib/data-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Search, MessageSquare } from "lucide-react";
import { StatusBadge } from "./dashboard";

export const Route = createFileRoute("/rents")({
  head: () => ({ meta: [{ title: "Rent Management — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <RentsPage />
    </RequireAuth>
  ),
});

function RentsPage() {
  const rents = useStore(getRents);
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");

  const [paying, setPaying] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");
  const [successTx, setSuccessTx] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = rents;
    if (status !== "all") list = list.filter((r) => r.status === status);
    if (propertyFilter !== "all") list = list.filter((r) => r.propertyName === propertyFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((r) => r.tenantName.toLowerCase().includes(s) || r.unitLabel.toLowerCase().includes(s));
    }
    return [...list].sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return b.dueDate.localeCompare(a.dueDate);
    });
  }, [rents, status, propertyFilter, search, sortBy]);

  const totals = useMemo(() => {
    return {
      paid: filtered.filter((r) => r.status === "paid").reduce((a, b) => a + b.amount, 0),
      pending: filtered.filter((r) => r.status === "pending").reduce((a, b) => a + b.amount, 0),
      overdue: filtered.filter((r) => r.status === "overdue").reduce((a, b) => a + b.amount, 0),
    };
  }, [filtered]);

  const current = rents.find((r) => r.id === paying);

  const startPayment = (id: string) => {
    setPaying(id);
    setStage("form");
  };

  const processPayment = () => {
    if (!current) return;
    setStage("processing");
    setTimeout(() => {
      const updated = payRent(current.id);
      setSuccessTx(updated?.transactionId ?? "PYT00000");
      setStage("success");
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Rent Management"
        subtitle={`${filtered.length} records · ${formatKES(totals.paid + totals.pending + totals.overdue)} total`}
      />

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryChip label="Paid" amount={totals.paid} accent="success" />
        <SummaryChip label="Pending" amount={totals.pending} accent="warning" />
        <SummaryChip label="Overdue" amount={totals.overdue} accent="destructive" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tenant or unit" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | PaymentStatus)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All properties</SelectItem>
            {PROPERTIES.map((p) => (
              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "amount" | "status")}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by date</SelectItem>
            <SelectItem value="amount">Sort by amount</SelectItem>
            <SelectItem value="status">Sort by status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Tenant</th>
                <th className="text-left font-medium px-4 py-3">Unit · Property</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
                <th className="text-left font-medium px-4 py-3">Due date</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Days</th>
                <th className="text-right font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => {
                const days = daysUntil(r.dueDate);
                let daysLabel = "";
                if (r.status === "paid") daysLabel = `Paid ${r.paidDate ? formatDate(r.paidDate) : ""}`;
                else if (r.status === "overdue") daysLabel = `${Math.abs(days)} days late`;
                else if (days <= 0) daysLabel = "Due today";
                else daysLabel = `${days} days left`;

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.tenantName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{r.unitLabel}</div>
                      <div className="text-xs">{r.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatKES(r.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.dueDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className={`px-4 py-3 text-xs ${r.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {daysLabel}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== "paid" ? (
                        <Button size="sm" onClick={() => startPayment(r.id)}>Record payment</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">{r.transactionId}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No records match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog open={!!paying} onOpenChange={(o) => { if (!o) { setPaying(null); setStage("form"); } }}>
        <DialogContent>
          {current && stage === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Record payment</DialogTitle>
                <DialogDescription>
                  Confirm payment received from {current.tenantName} for {current.unitLabel}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 my-2">
                <Row label="Tenant" value={current.tenantName} />
                <Row label="Unit" value={`${current.unitLabel} · ${current.propertyName}`} />
                <Row label="Due date" value={formatDate(current.dueDate)} />
                <Row label="Amount" value={<span className="text-lg font-semibold">{formatKES(current.amount)}</span>} />
                <Row label="Method" value="M-Pesa (demo)" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaying(null)}>Cancel</Button>
                <Button onClick={processPayment}>Confirm payment</Button>
              </DialogFooter>
            </>
          )}
          {stage === "processing" && (
            <div className="py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="mt-4 font-medium">Processing payment…</p>
              <p className="text-sm text-muted-foreground">Sending SMS confirmation</p>
            </div>
          )}
          {stage === "success" && current && (
            <div className="py-6 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Payment recorded</h3>
              <p className="text-sm text-muted-foreground">{formatKES(current.amount)} from {current.tenantName}</p>
              <p className="mt-1 text-xs text-muted-foreground font-mono">Tx: {successTx}</p>

              <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-left">
                <div className="flex items-center gap-2 text-xs uppercase font-medium text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> SMS sent
                </div>
                <pre className="mt-2 text-xs whitespace-pre-wrap font-sans">
{`✅ PAYMENT RECEIVED
Amount: ${formatKES(current.amount)}
Date: ${new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
Transaction: ${successTx}
Thank you for prompt payment!`}
                </pre>
              </div>

              <Button className="mt-5 w-full" onClick={() => { setPaying(null); setStage("form"); }}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function SummaryChip({ label, amount, accent }: { label: string; amount: number; accent: "success" | "warning" | "destructive" }) {
  const cls = {
    success: "border-success/30 bg-success/5",
    warning: "border-warning/40 bg-warning/5",
    destructive: "border-destructive/30 bg-destructive/5",
  }[accent];
  return (
    <div className={`rounded-lg border ${cls} px-4 py-3`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-semibold tracking-tight mt-0.5">{formatKES(amount)}</p>
    </div>
  );
}
