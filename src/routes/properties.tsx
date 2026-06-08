import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageHeader } from "@/components/page-header";
import { PROPERTIES, formatKES } from "@/lib/mock-data";
import { Building2, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/properties")({
  head: () => ({ meta: [{ title: "Properties — Rentik" }] }),
  component: () => (
    <RequireAuth role="landlord">
      <PropertiesPage />
    </RequireAuth>
  ),
});

function PropertiesPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader title="Properties" subtitle="Your portfolio across Nairobi." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROPERTIES.map((p) => {
          const occupancy = Math.round((p.occupiedUnits / p.totalUnits) * 100);
          return (
            <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition-shadow">
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold tracking-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.type}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Stat icon={Building2} label="Units" value={p.totalUnits.toString()} />
                  <Stat icon={Users} label="Occupied" value={`${p.occupiedUnits}`} />
                  <Stat label="Rate" value={`${occupancy}%`} />
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Monthly income</span>
                  <span className="font-semibold">{formatKES(p.monthlyIncome)}</span>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-success" style={{ width: `${occupancy}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2 py-2 text-center">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground mx-auto mb-1" />}
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
