import { createFileRoute } from '@tanstack/react-router';
import { CreateIssuePage } from '@/pages/issues/create';

export const Route = createFileRoute('/create-issue')({
  component: CreateIssuePage,
});
