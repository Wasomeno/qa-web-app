import { createFileRoute } from '@tanstack/react-router';
import { BoardsPage } from '@/pages/boards';

export const Route = createFileRoute('/boards')({
  component: BoardsPage,
});
