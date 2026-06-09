import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { register } from "@/lib/auth-store";
import type { UserRole } from "@/lib/mock-data";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Rentik" },
      { name: "description", content: "Create your Rentik account to start managing your properties." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("landlord");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = register({ name, email, password, phone, role });
    if (!result.user) {
      setError(result.error ?? "Could not create account.");
      return;
    }
    navigate({ to: result.user.role === "landlord" ? "/dashboard" : "/tenant" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 w-fit mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Rentik</span>
        </Link>

        <div className="rounded-2xl border bg-gradient-card shadow-soft p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing your properties in minutes. No email verification required.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Mwangi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 712 345 678" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="landlord" id="r-landlord" />
                  <span className="text-sm font-medium">Landlord</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="tenant" id="r-tenant" />
                  <span className="text-sm font-medium">Tenant</span>
                </label>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="lg">
              Create account <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
