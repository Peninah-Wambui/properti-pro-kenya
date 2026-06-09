import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { getExpenses, getRents, addExpense, useStore } from "@/lib/data-store";
import { PROPERTIES, formatKES, formatDate, type ExpenseCategory } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses & Reports — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <ExpensesPage />
    </RequireAuth>
  ),
});

const CATEGORIES: ExpenseCategory[] = ["Repairs", "Utilities", "Cleaning", "Security", "Taxes", "Insurance", "Other"];
const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b"];

function ExpensesPage() {
  const expenses = useStore(getExpenses);
  const rents = useStore(getRents);
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => (propertyFilter === "all" ? expenses : expenses.filter((e) => e.propertyName === propertyFilter)),
    [expenses, propertyFilter],
  );

  // Monthly aggregation (last 6 months)
  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m) => map.set(m, { month: m, income: 0, expense: 0 }));

    filtered.forEach((e) => {
      const m = new Date(e.date).toLocaleDateString("en-KE", { month: "short" });
      const entry = map.get(m);
      if (entry) entry.expense += e.amount;
    });
    rents.filter((r) => r.status === "paid").forEach((r) => {
      const m = new Date(r.paidDate ?? r.dueDate).toLocaleDateString("en-KE", { month: "short" });
      const entry = map.get(m);
      if (entry) entry.income += r.amount;
    });

    return months.map((m) => map.get(m)!);
  }, [filtered, rents]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [filtered]);

  const totalExpense = filtered.reduce((a, b) => a + b.amount, 0);
  const ytdIncome = monthly.reduce((a, b) => a + b.income, 0);
  const ytdNet = ytdIncome - totalExpense;
  const lastMonth = monthly[monthly.length - 1];
  const lastNet = lastMonth.income - lastMonth.expense;

  const exportCSV = () => {
    const header = "Date,Property,Category,Vendor,Amount,Description\n";
    const rows = filtered
      .map((e) => `${formatDate(e.date)},${e.propertyName},${e.category},"${e.vendor}",${e.amount},"${e.description}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rentik-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Expenses & Reports"
        subtitle="Track operating costs and run financial reports across your portfolio."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Log expense</Button>
              </DialogTrigger>
              <AddExpenseDialog onDone={() => setOpen(false)} />
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric icon={Wallet} label="Income (6 mo)" value={formatKES(ytdIncome)} accent="success" />
        <Metric icon={TrendingDown} label="Expenses (6 mo)" value={formatKES(totalExpense)} accent="destructive" />
        <Metric icon={TrendingUp} label="Net (6 mo)" value={formatKES(ytdNet)} accent="primary" />
        <Metric icon={TrendingUp} label={`${lastMonth.month} net`} value={formatKES(lastNet)} accent={lastNet >= 0 ? "success" : "destructive"} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All properties</SelectItem>
            {PROPERTIES.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-soft">
          <h3 className="font-semibold tracking-tight mb-4">Income vs expenses · last 6 months</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatKES(v)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <h3 className="font-semibold tracking-tight mb-4">By category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {byCategory.map((_, i) => (<Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />))}
              </Pie>
              <Tooltip formatter={(v: number) => formatKES(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Property</th>
                <th className="text-left font-medium px-4 py-3">Category</th>
                <th className="text-left font-medium px-4 py-3">Vendor</th>
                <th className="text-left font-medium px-4 py-3">Description</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">{e.propertyName}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{e.category}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{e.vendor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.description}</td>
                  <td className="px-4 py-3 text-right font-semibold text-destructive">−{formatKES(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddExpenseDialog({ onDone }: { onDone: () => void }) {
  const [property, setProperty] = useState(PROPERTIES[0].name);
  const [category, setCategory] = useState<ExpenseCategory>("Repairs");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      date: new Date().toISOString(),
      propertyName: property,
      category,
      vendor,
      amount: Number(amount) || 0,
      description,
    });
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Log an expense</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Property</Label>
            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTIES.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Nairobi Plumbing Co." required />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (KES)</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required />
        </div>
        <DialogFooter>
          <Button type="submit">Save expense</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: "success" | "warning" | "destructive" | "primary" }) {
  const cls = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary",
  }[accent];
  return (
    <div className="rounded-xl border bg-gradient-card p-5 shadow-soft">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
