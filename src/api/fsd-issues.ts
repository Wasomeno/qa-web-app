import { api } from "@/services/api";
import type { Issue } from "@/api/issue";

export interface FSDIssueSource {
  path: string;
  ref?: string;
}

export interface FSDIssueDraft {
  sourcePath: string;
  title: string;
  description: string;
  labels: string[];
}

export interface PreviewFSDIssuesRequest {
  fsds: FSDIssueSource[];
}

export interface PreviewFSDIssuesResponse {
  projectId: string;
  specsRepoId: number;
  issueRepoId: number;
  issues: FSDIssueDraft[];
  previewCount: number;
}

export interface CreateFSDIssuesRequest {
  issues: FSDIssueDraft[];
}

export interface CreateFSDIssueResult {
  sourcePath?: string;
  title: string;
  status: "success" | "failed";
  issue?: Issue;
  error?: string;
}

export interface CreateFSDIssuesResponse {
  projectId: string;
  issueRepoId: number;
  createdCount: number;
  failedCount: number;
  results: CreateFSDIssueResult[];
}

export async function previewFSDIssues(
  projectId: number | string,
  request: PreviewFSDIssuesRequest,
) {
  return api.post<PreviewFSDIssuesResponse>(
    `/projects/${projectId}/fsd-issues/preview`,
    { body: JSON.stringify(request) },
  );
}

export async function createFSDIssues(
  projectId: number | string,
  request: CreateFSDIssuesRequest,
) {
  return api.post<CreateFSDIssuesResponse>(
    `/projects/${projectId}/fsd-issues`,
    { body: JSON.stringify(request) },
  );
}
