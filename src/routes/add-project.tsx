import { createFileRoute } from "@tanstack/react-router";
import { AddProjectPage } from "@/pages-new/add-project";

export const Route = createFileRoute("/add-project")({
  component: AddProjectPage,
});
