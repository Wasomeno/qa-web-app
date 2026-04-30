import { createFileRoute } from '@tanstack/react-router';
import { TestScenariosPage } from '@/pages/test-scenarios';

export const Route = createFileRoute('/test-scenarios/')({
  component: TestScenariosPage,
});
