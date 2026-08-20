import { createFileRoute } from "@tanstack/react-router";
import { TestsListPage } from "@/pages-new/tests-list";

export const Route = createFileRoute("/tests/")({
  component: TestsListPage,
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search.project === "string" ? search.project : undefined,
  }),
});
