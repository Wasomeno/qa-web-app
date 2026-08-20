import { createFileRoute } from "@tanstack/react-router";
import { TestDetailPage } from "@/pages-new/test-detail";

export const Route = createFileRoute("/projects/$id/test-scenarios/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <TestDetailPage testId={id} />;
  },
});
