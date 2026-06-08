import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/lib/auth-store";
import { getRents, payRent, useStore } from "@/lib/data-store";
import { formatKES, formatDate, daysUntil } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, CalendarDays, Wallet, History, MessageSquare } from "lucide-react";
import { StatusBadge } from "./dashboard";

export const Route = createFileRoute("/tenant/")({
  head: () => ({ meta: [{ title: "My Dashboard — Rentik" }] }),
  component: TenantDashboard,
});

function TenantDashboard() {
  const user = useCurrentUser();
  const rents = useStore(getRents);
  const [stage, setStage] = useState<"idle" | "form" | "processing" | "success">("idle");
  const [tx, setTx] = useState<string | null>(null);

  if (!user) return null;
  const myRents = rents.filter((r) => r.tenantId === user.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const current = myRents.find((r) => r.status !== "paid") ?? myRents[0];
  const history = myRents.filter((r) => r.status === "paid").slice(0, 3);

  const days = current ? daysUntil(current.dueDate) : 0;

  const pay = () => {
    if (!current) return;
    setStage("processing");
    setTimeout(() => {
      const updated = payRent(current.id);
      setTx(updated?.transactionId ?? "PYT00000");
      setStage("success");
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <PageHeader title={`Hi, ${user.name.split(" ")[0]}`} subtitle="Here's your rental summary." />

      {current && (
        <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6 md:p-8 shadow-elegant overflow-hidden relative">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary-foreground/70 font-medium">Next payment</p>
                <p className="mt-1 text-4xl md:text-5xl font-semibold tracking-tight">{formatKES(current.amount)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-primary-foreground/85">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> Due {formatDate(current.dueDate)}
                  </span>
                  <span>·</span>
                  <span>
                    {current.status === "overdue"
                      ? `${Math.abs(days)} days overdue`
                      : days <= 0 ? "Due today" : `${days} days remaining`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={current.status} />
                <p className="text-xs text-primary-foreground/70 mt-2">{current.unitLabel} · {current.propertyName}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button size="lg" variant="secondary" onClick={() => setStage("form")} disabled={current.status === "paid"}>
                <Wallet className="mr-2 h-4 w-4" /> Pay rent now
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold tracking-tight">Payment history</h3>
          </div>
          <div className="divide-y">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{formatDate(h.dueDate).split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground">Paid {h.paidDate ? formatDate(h.paidDate) : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatKES(h.amount)}</p>
                  <p className="text-[10px] text-success font-medium uppercase tracking-wide">Paid</p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No payments recorded yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h3 className="font-semibold tracking-tight">Lease information</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Property" value={current?.propertyName ?? "—"} />
            <Row label="Unit" value={current?.unitLabel ?? "—"} />
            <Row label="Monthly rent" value={current ? formatKES(current.amount) : "—"} />
            <Row label="Lease start" value="January 15, 2023" />
            <Row label="Lease end" value="January 14, 2025" />
            <Row label="Days remaining" value="38 days" />
          </div>
          <Button variant="outline" className="mt-5 w-full">
            <MessageSquare className="mr-2 h-4 w-4" /> Message landlord
          </Button>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog open={stage !== "idle"} onOpenChange={(o) => { if (!o) setStage("idle"); }}>
        <DialogContent>
          {stage === "form" && current && (
            <>
              <DialogHeader>
                <DialogTitle>Pay rent</DialogTitle>
                <DialogDescription>Confirm your rent payment for {current.unitLabel}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 my-2">
                <Row label="Amount" value={<span className="text-lg font-semibold">{formatKES(current.amount)}</span>} />
                <Row label="Due date" value={formatDate(current.dueDate)} />
                <Row label="Method" value="M-Pesa STK Push" />
                <Row label="Phone" value={user.phone} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStage("idle")}>Cancel</Button>
                <Button onClick={pay}>Confirm payment</Button>
              </DialogFooter>
            </>
          )}
          {stage === "processing" && (
            <div className="py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="mt-4 font-medium">Processing your payment…</p>
              <p className="text-sm text-muted-foreground">Check your phone for M-Pesa prompt</p>
            </div>
          )}
          {stage === "success" && current && (
            <div className="py-6 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Payment received!</h3>
              <p className="text-sm text-muted-foreground">Thank you, {user.name.split(" ")[0]}.</p>
              <p className="mt-1 text-xs text-muted-foreground font-mono">Transaction: {tx}</p>
              <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-left">
                <div className="flex items-center gap-2 text-xs uppercase font-medium text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> SMS confirmation
                </div>
                <pre className="mt-2 text-xs whitespace-pre-wrap font-sans">
{`✅ PAYMENT RECEIVED
Amount: ${formatKES(current.amount)}
Date: ${new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
Transaction: ${tx}
Thank you!`}
                </pre>
              </div>
              <Button className="mt-5 w-full" onClick={() => setStage("idle")}>Done</Button>
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
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
