import { createFileRoute } from '@tanstack/react-router';
import { SessionsListPage } from '@/pages/agent/sessions-list';

export const Route = createFileRoute('/chat-sessions/')({
  component: SessionsListPage,
});
