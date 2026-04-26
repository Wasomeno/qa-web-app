import { createFileRoute } from '@tanstack/react-router';
import { FixSessionsListPage } from '@/pages/agent/fix-sessions-list';

export const Route = createFileRoute('/fix-sessions')({
  component: FixSessionsListPage,
});
