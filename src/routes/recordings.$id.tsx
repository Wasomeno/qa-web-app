import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getRecording } from '@/api/recording';
import { RecordingDetailPage, RecordingDetailSkeleton } from '@/pages/recordings';

function RecordingsDetailRoute() {
  const { id } = Route.useParams();

  const { data: blueprint, isLoading } = useQuery({
    queryKey: ['recording', id],
    queryFn: () => getRecording(id),
  });

  if (isLoading) {
    return <RecordingDetailSkeleton />;
  }

  if (!blueprint) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Recording not found</div>
      </div>
    );
  }

  return <RecordingDetailPage blueprint={blueprint} />;
}

export const Route = createFileRoute('/recordings/$id')({
  component: RecordingsDetailRoute,
});
