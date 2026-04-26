import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginPage from '@/pages/login';
import { useSession } from '@/contexts/session-context';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    // Note: Can't use hooks here, so we check in the component instead
  },
});
