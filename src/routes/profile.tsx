import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage as NewProfilePage } from "@/pages-new/profile";

export const Route = createFileRoute("/profile")({
  component: NewProfilePage,
});
