import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/lib/auth-store";
import { getRents, useStore } from "@/lib/data-store";
import { formatKES, formatDate } from "@/lib/mock-data";
import { StatusBadge } from "./dashboard";

export const Route = createFileRoute("/tenant/payments")({
  head: () => ({ meta: [{ title: "My Payments — Rentik" }] }),
  component: TenantPayments,
});

function TenantPayments() {
  const user = useCurrentUser();
  const rents = useStore(getRents);
  if (!user) return null;
  const mine = rents.filter((r) => r.tenantId === user.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader title="My Payments" subtitle="Your full rent history." />
      <div className="rounded-xl border bg-card overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Due date</th>
              <th className="text-right font-medium px-4 py-3">Amount</th>
              <th className="text-left font-medium px-4 py-3">Paid on</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Transaction</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mine.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{formatDate(r.dueDate)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatKES(r.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.paidDate ? formatDate(r.paidDate) : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.transactionId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
