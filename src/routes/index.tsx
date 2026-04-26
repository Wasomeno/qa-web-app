import { createFileRoute } from '@tanstack/react-router';
import { AgentPage } from '@/pages/agent';

export const Route = createFileRoute('/')({
  component: AgentPage,
});
