import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Rentik" }] }),
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

function SettingsPage() {
  const user = useCurrentUser();
  if (!user) return null;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account and notification preferences." />

      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="font-semibold tracking-tight">Profile</h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <Field label="Name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field label="Role" value={user.role} />
          {user.subscription && <Field label="Subscription" value={user.subscription} />}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="font-semibold tracking-tight">Notification preferences</h3>
        <p className="text-sm text-muted-foreground mt-1">
          SMS reminders before due dates, payment confirmations, and overdue notices are enabled by default.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <Pref label="Rent due reminders (3 days before)" enabled />
          <Pref label="Payment confirmation SMS" enabled />
          <Pref label="Overdue notifications" enabled />
          <Pref label="Daily landlord summary (7:00 AM)" enabled={user.role === "landlord"} />
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}

function Pref({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <li className="flex justify-between items-center py-2 border-b last:border-0">
      <span>{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
        {enabled ? "Enabled" : "Off"}
      </span>
    </li>
  );
}
