import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { NewAppShell } from "@/components-new/app-shell";

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    // Public pages render without the app shell (no sidebar/header)
    const publicPaths = new Set(["/", "/login"]);
    const isPublic = publicPaths.has(location.pathname);

    return (
      <>
        {isPublic ? (
          <Outlet />
        ) : (
          <NewAppShell>
            <Outlet />
          </NewAppShell>
        )}
        <Toaster position="bottom-right" />
      </>
    );
  },
});
