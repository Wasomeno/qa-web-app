import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScenarioDetail, ScenarioDetailSkeleton } from '@/pages/test-scenarios/components/scenario-detail';
import { testScenarioApi } from '@/api/test-scenario';

function TestScenariosDetailRoute() {
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: scenario, isLoading } = useQuery({
    queryKey: ['test-scenario', id],
    queryFn: () => testScenarioApi.getScenario(id),
  });

  const generateMutation = useMutation({
    mutationFn: (sectionIds: string[]) =>
      testScenarioApi.generateTests(id, { sectionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-scenario', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => testScenarioApi.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-scenarios'] });
      router.history.back();
    },
  });

  const updateScenarioMutation = useMutation({
    mutationFn: (data: any) => testScenarioApi.updateScenario(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['test-scenario', id], updated);
    },
  });

  const updateTestCaseMutation = useMutation({
    mutationFn: ({ sectionId, tcId, data }: { sectionId: string; tcId: string; data: any }) =>
      testScenarioApi.updateTestCase(id, sectionId, tcId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['test-scenario', id], updated);
    },
  });

  const reorderTestCasesMutation = useMutation({
    mutationFn: ({ sectionId, orderedIds }: { sectionId: string; orderedIds: string[] }) =>
      testScenarioApi.reorderTestCases(id, sectionId, orderedIds),
    onSuccess: (updated) => {
      queryClient.setQueryData(['test-scenario', id], updated);
    },
  });

  if (isLoading) {
    return <ScenarioDetailSkeleton />;
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-zinc-500">Scenario not found</div>
      </div>
    );
  }

  return (
    <ScenarioDetail
      scenario={scenario}
      onClose={() => router.history.back()}
      onGenerate={(sectionIds) => generateMutation.mutate(sectionIds)}
      onDelete={() => deleteMutation.mutate()}
      onUpdateScenario={async (scenarioId, data) => {
        await updateScenarioMutation.mutateAsync(data);
      }}
      onUpdateTestCase={async (sectionId, tcId, data) => {
        await updateTestCaseMutation.mutateAsync({ sectionId, tcId, data });
      }}
      onReorderTestCases={async (sectionId, orderedIds) => {
        await reorderTestCasesMutation.mutateAsync({ sectionId, orderedIds });
      }}
    />
  );
}

export const Route = createFileRoute('/test-scenarios/$id')({
  component: TestScenariosDetailRoute,
});
