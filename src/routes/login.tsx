import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Rentik" },
      { name: "description", content: "Sign in to your Rentik property management account." },
    ],
  }),
  component: LoginPage,
});

const demoAccounts = [
  { label: "Landlord (John)", email: "john@properties.com" },
  { label: "Landlord (Sarah)", email: "sarah@rental.com" },
  { label: "Tenant (Grace)", email: "grace@email.com" },
  { label: "Tenant (David)", email: "david@email.com" },
  { label: "Tenant (Peter)", email: "peter@email.com" },
];

function LoginPage() {
  const current = useCurrentUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("john@properties.com");
  const [password, setPassword] = useState("Demo@123");
  const [error, setError] = useState("");

  if (current) return <Navigate to={current.role === "landlord" ? "/dashboard" : "/tenant"} />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = login(email, password);
    if (!user) {
      setError("Invalid email or password. Try the demo accounts below.");
      return;
    }
    navigate({ to: user.role === "landlord" ? "/dashboard" : "/tenant" });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex relative bg-gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">Rentik</span>
        </Link>
        <div>
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            "Rentik cut my rent-collection time by 70%."
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            — Jane Mwangi, landlord of 14 units in Westlands
          </p>
        </div>
        <div className="text-sm text-primary-foreground/70">
          Trusted by 1,200+ landlords across Kenya
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Rentik</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your properties.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="lg">
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 rounded-lg border bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick demo accounts · password <code className="font-mono">Demo@123</code>
            </p>
            <div className="mt-3 grid gap-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword("Demo@123"); }}
                  className="text-left text-sm px-2 py-1.5 rounded hover:bg-background transition-colors flex justify-between items-center"
                >
                  <span>{a.label}</span>
                  <span className="text-xs text-muted-foreground">{a.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            New to Rentik?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
