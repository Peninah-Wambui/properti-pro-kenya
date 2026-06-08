import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { getSms, useStore } from "@/lib/data-store";
import { MessageSquare, Bell, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "SMS Log — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <MessagesPage />
    </RequireAuth>
  ),
});

const typeMeta = {
  reminder: { icon: Bell, cls: "bg-primary/10 text-primary", label: "Reminder" },
  received: { icon: CheckCircle2, cls: "bg-success/10 text-success", label: "Payment received" },
  overdue: { icon: AlertCircle, cls: "bg-destructive/10 text-destructive", label: "Overdue notice" },
  report: { icon: BarChart3, cls: "bg-accent text-accent-foreground", label: "Daily report" },
} as const;

function MessagesPage() {
  const messages = useStore(getSms);
  const sorted = [...messages].sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader title="SMS Log" subtitle={`${messages.length} messages sent · Automatic reminders, receipts & daily reports`} />

      <div className="space-y-3">
        {sorted.map((m) => {
          const meta = typeMeta[m.type];
          const Icon = meta.icon;
          return (
            <div key={m.id} className="rounded-xl border bg-card p-4 shadow-soft flex gap-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.cls}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-sm">{m.recipient}</p>
                    <span className="text-xs text-muted-foreground">{m.to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.sentAt).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
                <pre className="mt-2 text-sm whitespace-pre-wrap font-sans text-foreground/90">{m.body}</pre>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3" />
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
