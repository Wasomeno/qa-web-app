import { createFileRoute } from '@tanstack/react-router';
import { PinnedPage } from '@/pages/pinned';

export const Route = createFileRoute('/pinned')({
  component: PinnedPage,
});
