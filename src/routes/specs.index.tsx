import { createFileRoute } from '@tanstack/react-router';
import { SpecsPage } from '@/pages/specs';

export const Route = createFileRoute('/specs/')({
  component: SpecsPage,
});
