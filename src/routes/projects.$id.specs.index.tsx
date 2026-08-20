import { createFileRoute } from "@tanstack/react-router";
import { SpecsListPage } from "@/pages-new/specs-list";

export const Route = createFileRoute("/projects/$id/specs/")({
  component: () => {
    const { id } = Route.useParams();
    return <SpecsListPage defaultProject={id} />;
  },
});
