import { createRootRoute, Outlet, useLocation, Navigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/main-layout';
import { NavigationProvider } from '@/contexts/navigation-context';
import { useSession } from '@/contexts/session-context';
import { Loader2 } from 'lucide-react';

function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col min-h-0"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export const Route = createRootRoute({
  component: () => {
    const session = useSession();
    const user = session?.user;
    const loading = session?.loading;
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    if (loading && !user) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      );
    }

    if (!user && !isLoginPage) {
      return <Navigate to="/login" />;
    }

    if (user && isLoginPage) {
      return <Navigate to="/" />;
    }

    return (
      <NavigationProvider initialView="agent">
        {isLoginPage ? (
          <AnimatedOutlet />
        ) : (
          <MainLayout>
            <AnimatedOutlet />
          </MainLayout>
        )}
        <Toaster position="bottom-right" />
      </NavigationProvider>
    );
  },
});
