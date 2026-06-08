import { Navigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth-store";
import { AppShell } from "./app-shell";
import type { UserRole } from "@/lib/mock-data";

export function RequireAuth({
  role,
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "landlord" ? "/dashboard" : "/tenant"} />;
  }
  return <AppShell user={user}>{children}</AppShell>;
}
