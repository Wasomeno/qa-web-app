import { createFileRoute } from "@tanstack/react-router";
import { NewLoginPage } from "@/pages-new/login";

export const Route = createFileRoute("/login")({
  component: NewLoginPage,
});
