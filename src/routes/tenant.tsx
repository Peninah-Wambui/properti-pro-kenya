import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/tenant")({
  component: () => (
    <RequireAuth role="tenant">
      <Outlet />
    </RequireAuth>
  ),
});
