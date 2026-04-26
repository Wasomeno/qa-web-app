import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/main-layout';
import { NavigationProvider } from '@/contexts/navigation-context';

function AnimatedOutlet() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, ...(isHome ? {} : { x: -8 }) }}
        animate={{ opacity: 1, ...(isHome ? {} : { x: 0 }) }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="flex-1 flex flex-col min-h-0"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export const Route = createRootRoute({
  component: () => (
    <NavigationProvider initialView="agent">
      <MainLayout>
        <AnimatedOutlet />
      </MainLayout>
      <Toaster position="bottom-right" />
    </NavigationProvider>
  ),
});
