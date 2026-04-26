import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { testScenarioApi } from '@/api/test-scenario';
import { ScenarioDetail } from '@/pages/test-scenarios/components/scenario-detail';

function TestScenariosDetailRoute() {
  const { id } = Route.useParams();
  const router = useRouter();

  const { data: scenario, isLoading } = useQuery({
    queryKey: ['test-scenario', id],
    queryFn: () => testScenarioApi.getScenario(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Loading scenario...</div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Scenario not found</div>
      </div>
    );
  }

  return (
    <ScenarioDetail
      scenario={scenario}
      onClose={() => router.history.back()}
      onGenerate={(sheets) => {
        testScenarioApi.generateTests(id, sheets).then(() => {
          window.location.reload();
        });
      }}
      onDelete={async () => {
        await testScenarioApi.deleteScenario(id);
        router.history.back();
      }}
      onViewGeneratedId={(generatedId) => {
        router.navigate({ to: '/recordings/$id', params: { id: generatedId } });
      }}
    />
  );
}

export const Route = createFileRoute('/test-scenarios/$id')({
  component: TestScenariosDetailRoute,
});
