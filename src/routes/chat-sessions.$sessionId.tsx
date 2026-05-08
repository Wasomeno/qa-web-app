import { createFileRoute } from '@tanstack/react-router';
import { ChatViewPage } from '@/pages/agent/chat-view-page';

export const Route = createFileRoute('/chat-sessions/$sessionId')({
  component: ChatSessionDetailRoute,
});

function ChatSessionDetailRoute() {
  const { sessionId } = Route.useParams();
  return <ChatViewPage sessionId={sessionId} />;
}
