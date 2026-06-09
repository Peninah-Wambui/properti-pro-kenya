import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Receipt, FileText, Wrench, TrendingUp } from "lucide-react";

const STORAGE_KEY = "pms.onboarded.v1";

const steps = [
  {
    icon: LayoutDashboard,
    title: "Welcome to Rentik",
    body: "Your command center for managing properties across Kenya. Take a quick 30-second tour of the essentials.",
  },
  {
    icon: Receipt,
    title: "Rent Management",
    body: "Track every payment with status filters, record M-Pesa receipts in one click, and auto-send SMS confirmations to tenants.",
  },
  {
    icon: FileText,
    title: "Leases & Tenants",
    body: "Centralized tenant profiles, lease terms, deposits, and documents — with renewal alerts for leases ending in 60 days.",
  },
  {
    icon: Wrench,
    title: "Maintenance Workflow",
    body: "Assign vendors, track repair costs, and close tickets when complete. Tenants submit requests directly from their portal.",
  },
  {
    icon: TrendingUp,
    title: "Reports & Analytics",
    body: "Live revenue trends, expense breakdown by category, and export monthly P&L reports to CSV for your accountant.",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setOpen(false);
  };

  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Icon className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center">{s.title}</DialogTitle>
          <DialogDescription className="text-center">{s.body}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1.5 my-3">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>Skip tour</Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button>
            )}
            {!isLast ? (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button size="sm" onClick={finish}>Get started</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
