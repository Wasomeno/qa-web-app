import {
  FixIssueRequest,
  FixSession,
  FixEvent,
  FixStep,
} from "@/types/agent-fix";
import { api } from "@/services/api";

export interface FixIssueCallbacks {
  onEvent: (event: FixEvent) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

// POST /agent/fix-issue - Starts a fix agent session and returns session_id
export async function startFixIssue(
  projectId: number,
  issueIid: number,
  options?: {
    appProjectId?: string;
    repoProjectId?: number;
    targetBranch?: string;
    additionalContext?: string;
  },
): Promise<{ session_id: string; message: string }> {
  const payload: FixIssueRequest & { app_project_id?: string } = {
    project_id: projectId,
    issue_iid: issueIid,
    runner: "pi",
  };

  if (options?.appProjectId) {
    payload.app_project_id = options.appProjectId;
  }

  if (options?.repoProjectId !== undefined) {
    payload.repo_project_id = options.repoProjectId;
  }

  if (options?.targetBranch) {
    payload.target_branch = options.targetBranch;
  }

  if (options?.additionalContext) {
    payload.additional_context = options.additionalContext;
  }

  const response = await api.post<{ session_id: string; message: string }>(
    "/agent/fix-issue",
    {
      body: payload as any,
    },
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to start fix agent");
  }

  return response.data;
}

// GET /agent/fix-status/:session_id - Get status of a fix session
export async function getFixSessionStatus(
  sessionId: string,
): Promise<FixSession> {
  const response = await api.get<FixSession>(`/agent/fix-status/${sessionId}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to get fix session status");
  }

  return response.data;
}

// GET /agent/fix-sessions/:session_id/details - Get detailed session info with steps and events
export async function getFixSessionDetails(
  sessionId: string,
): Promise<FixSession> {
  const response = await api.get<FixSession>(
    `/agent/fix-sessions/${sessionId}/details`,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to get fix session details");
  }

  return response.data;
}

// GET /agent/fix-sessions - List all fix sessions
export async function getFixSessions(
  projectId?: string,
): Promise<FixSession[]> {
  const response = await api.get<{ sessions: FixSession[] }>(
    projectId ? `/projects/${projectId}/fix-sessions` : "/agent/fix-sessions",
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to get fix sessions");
  }

  return response.data.sessions || [];
}

// DELETE /agent/fix-sessions/:session_id - Delete a fix session
export async function deleteFixSession(
  sessionId: string,
  projectId?: string,
): Promise<void> {
  const response = await api.delete(
    projectId
      ? `/projects/${projectId}/fix-sessions/${sessionId}`
      : `/agent/fix-sessions/${sessionId}`,
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to delete fix session");
  }
}
