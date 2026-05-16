import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ScenarioDetail,
  ScenarioDetailSkeleton,
} from "@/pages/test-scenarios/components/scenario-detail";
import { testScenarioApi } from "@/api/test-scenario";

function ProjectTestScenarioDetailRoute() {
  const { id: projectId, scenarioId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: scenario, isLoading } = useQuery({
    queryKey: ["test-scenario", projectId, scenarioId],
    queryFn: () => testScenarioApi.getScenario(scenarioId, projectId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => testScenarioApi.deleteScenario(scenarioId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["test-scenarios", projectId],
      });
      router.history.back();
    },
  });

  if (isLoading) return <ScenarioDetailSkeleton nested />;

  if (!scenario) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-zinc-500">Scenario not found</div>
      </div>
    );
  }

  return (
    <ScenarioDetail
      scenario={scenario}
      projectId={projectId}
      onClose={() => router.history.back()}
      onGenerate={() => {}}
      onDelete={() => deleteMutation.mutate()}
      onUpdateScenario={async (_scenarioId, data) => {
        const updated = await testScenarioApi.updateScenario(
          scenarioId,
          data,
          projectId,
        );
        queryClient.setQueryData(
          ["test-scenario", projectId, scenarioId],
          updated,
        );
      }}
      onUpdateTestCase={async (sectionId, tcId, data) => {
        const updated = await testScenarioApi.updateTestCase(
          scenarioId,
          sectionId,
          tcId,
          data,
          projectId,
        );
        queryClient.setQueryData(
          ["test-scenario", projectId, scenarioId],
          updated,
        );
      }}
      onUpdateTestCaseAutomationCategory={async (sectionId, tcId, category) => {
        const updated = await testScenarioApi.updateTestCaseAutomationCategory(
          scenarioId,
          tcId,
          category,
          { projectId, sectionId },
        );
        if (updated && "sections" in updated) {
          queryClient.setQueryData(
            ["test-scenario", projectId, scenarioId],
            updated,
          );
        }
        return updated;
      }}
      onReorderTestCases={async (sectionId, orderedIds) => {
        const updated = await testScenarioApi.reorderTestCases(
          scenarioId,
          sectionId,
          orderedIds,
          projectId,
        );
        queryClient.setQueryData(
          ["test-scenario", projectId, scenarioId],
          updated,
        );
      }}
    />
  );
}

export const Route = createFileRoute(
  "/projects/$id/test-scenarios/$scenarioId",
)({
  component: ProjectTestScenarioDetailRoute,
});
