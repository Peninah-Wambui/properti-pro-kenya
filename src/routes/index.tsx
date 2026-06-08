import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Building2, ShieldCheck, BarChart3, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rentik — Property Management for Kenya" },
      { name: "description", content: "Modern, mobile-first property management for Kenyan landlords. Track rent, tenants and maintenance — all in one place." },
      { property: "og:title", content: "Rentik — Property Management for Kenya" },
      { property: "og:description", content: "Modern, mobile-first property management for Kenyan landlords." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const user = useCurrentUser();
  if (user) return <Navigate to={user.role === "landlord" ? "/dashboard" : "/tenant"} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Rentik</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-primary-foreground">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Trusted by 1,200+ Kenyan landlords
            </p>
            <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Property management,<br />simplified for Kenya.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-2xl">
              Collect rent on time, track tenants, handle maintenance and send SMS reminders — from your phone.
              Built for the way Kenyan landlords actually work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  Start free trial <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 text-primary-foreground border-white/20 hover:bg-white/20 hover:text-primary-foreground">
                <Link to="/login">View demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-primary-foreground/80">
              {["No setup fees", "M-Pesa ready", "Free for 1 property"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Real-time rent tracking", desc: "See every payment, pending and overdue rent across all your properties at a glance." },
            { icon: MessageSquare, title: "Automated SMS reminders", desc: "Tenants get gentle nudges before due dates. You get peace of mind." },
            { icon: ShieldCheck, title: "Secure tenant portal", desc: "Tenants pay, view history and report issues without calling you at 9pm." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-gradient-card p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-gradient-primary p-8 md:p-12 text-primary-foreground shadow-elegant">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Try the live demo</h2>
              <p className="mt-2 text-primary-foreground/80 max-w-xl">
                Sign in with <code className="rounded bg-white/10 px-1.5 py-0.5">john@properties.com</code> / <code className="rounded bg-white/10 px-1.5 py-0.5">Demo@123</code> to explore the landlord view.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">Open demo <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2024 Rentik. Built for Kenyan property owners.
      </footer>
    </div>
  );
}
