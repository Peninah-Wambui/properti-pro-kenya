import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { OnboardingTour } from "@/components/onboarding-tour";
import { PROPERTIES, formatKES, REVENUE_TREND, OCCUPANCY_TREND } from "@/lib/mock-data";
import { useStore, getRents } from "@/lib/data-store";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const rents = useStore(getRents);
  const december = rents.filter((r) => r.dueDate.startsWith("2024-12"));
  const collected = december.filter((r) => r.status === "paid").reduce((a, b) => a + b.amount, 0);
  const pending = december.filter((r) => r.status === "pending").reduce((a, b) => a + b.amount, 0);
  const overdue = rents.filter((r) => r.status === "overdue").reduce((a, b) => a + b.amount, 0);

  const totalUnits = PROPERTIES.reduce((a, b) => a + b.totalUnits, 0);
  const occupied = PROPERTIES.reduce((a, b) => a + b.occupiedUnits, 0);
  const occupancy = Math.round((occupied / totalUnits) * 100);
  const monthlyIncome = PROPERTIES.reduce((a, b) => a + b.monthlyIncome, 0);

  const recent = rents
    .slice()
    .sort((a, b) => (b.paidDate ?? b.dueDate).localeCompare(a.paidDate ?? a.dueDate))
    .slice(0, 6);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Welcome back, John"
        subtitle="Here's what's happening across your 3 properties today."
      />

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Wallet}
          label="Collected this month"
          value={formatKES(collected)}
          trend="+12.4%"
          trendUp
          accent="success"
        />
        <MetricCard
          icon={Clock}
          label="Pending payments"
          value={formatKES(pending)}
          sub={`${december.filter((r) => r.status === "pending").length} tenants`}
          accent="warning"
        />
        <MetricCard
          icon={AlertCircle}
          label="Overdue"
          value={formatKES(overdue)}
          sub={`${rents.filter((r) => r.status === "overdue").length} accounts`}
          accent="destructive"
        />
        <MetricCard
          icon={TrendingUp}
          label="Monthly revenue"
          value={formatKES(monthlyIncome)}
          trend="Target"
          accent="primary"
        />
      </div>

      {/* Second row */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Occupancy */}
        <div className="rounded-xl border bg-gradient-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Occupancy</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Healthy</span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-5xl font-semibold tracking-tight">{occupancy}%</span>
            <span className="text-sm text-muted-foreground pb-2">{occupied}/{totalUnits} units</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-success" style={{ width: `${occupancy}%` }} />
          </div>
          <div className="mt-6 space-y-3">
            {PROPERTIES.map((p) => {
              const rate = Math.round((p.occupiedUnits / p.totalUnits) * 100);
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{p.name}</span>
                    <span className="text-muted-foreground">{p.occupiedUnits}/{p.totalUnits}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Recent rent activity</h3>
            <a href="/rents" className="text-xs text-primary inline-flex items-center hover:underline">
              View all <ArrowUpRight className="ml-0.5 h-3 w-3" />
            </a>
          </div>
          <div className="mt-4 divide-y">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    r.status === "paid" ? "bg-success/10 text-success"
                    : r.status === "overdue" ? "bg-destructive/10 text-destructive"
                    : "bg-warning/15 text-warning-foreground"
                  }`}>
                    {r.status === "paid" ? <CheckCircle2 className="h-4 w-4" /> : r.status === "overdue" ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.tenantName}</p>
                    <p className="text-xs text-muted-foreground">{r.unitLabel} · {r.propertyName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatKES(r.amount)}</p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties row */}
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {PROPERTIES.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition-shadow">
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${p.image})` }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold tracking-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.location}</p>
                </div>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Units</p>
                  <p className="font-semibold">{p.occupiedUnits}/{p.totalUnits}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="font-semibold">{formatKES(p.monthlyIncome)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, sub, trend, trendUp, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  accent: "success" | "warning" | "destructive" | "primary";
}) {
  const colors = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary",
  }[accent];

  return (
    <div className="rounded-xl border bg-gradient-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? "text-success" : "text-muted-foreground"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: "paid" | "pending" | "overdue" }) {
  const map = {
    paid: "bg-success/10 text-success",
    pending: "bg-warning/15 text-warning-foreground",
    overdue: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide ${map[status]}`}>
      {status}
    </span>
  );
}

export { StatusBadge };
