import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages-new/dashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({}),
});
