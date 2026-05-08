import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AgentPage } from '@/pages/agent';

// Search params schema for the home page
const searchSchema = z.object({
  sessionId: z.string().optional(),
});

export const Route = createFileRoute('/')({
  component: AgentPage,
  validateSearch: searchSchema,
});
