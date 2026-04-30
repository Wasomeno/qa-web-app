import { api } from '@/services/api';

// --- Types ---

export interface FileTreeNode {
  path: string;
  name: string;
  type: 'tree' | 'blob';
  children?: FileTreeNode[];
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export interface SpecCommit {
  hash: string;
  shortHash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  committedDate: string;
  webUrl?: string;
}

export interface CommitDiff {
  oldPath: string;
  newPath: string;
  diff: string;
  newFile: boolean;
  renamedFile: boolean;
  deletedFile: boolean;
}

export interface CommitDetail extends SpecCommit {
  diffs: CommitDiff[];
}

export interface FileAction {
  action: 'create' | 'update' | 'delete' | 'move';
  filePath: string;
  content?: string;
  previousPath?: string;
}

// --- API Functions ---

export async function getSpecsTree(
  projectId: string | number,
  path = '',
  ref?: string,
  recursive = false
) {
  const params = new URLSearchParams({ path });
  if (ref) params.set('ref', ref);
  if (recursive) params.set('recursive', 'true');
  return api.get<{ tree: FileTreeNode[] }>(
    `/projects/${projectId}/specs/tree?${params}`
  );
}

/**
 * Fetch a single directory's immediate children (non-recursive).
 * Used for lazy-loading the file tree on expand.
 */
export async function getSpecsDirectory(
  projectId: string | number,
  dirPath: string,
  ref?: string
) {
  const params = new URLSearchParams({ path: dirPath });
  if (ref) params.set('ref', ref);
  return api.get<{ tree: FileTreeNode[] }>(
    `/projects/${projectId}/specs/tree?${params}`
  );
}

export async function getSpecsFile(
  projectId: string | number,
  filePath: string,
  ref?: string
) {
  const params = new URLSearchParams({ path: filePath });
  if (ref) params.set('ref', ref);
  return api.get<FileContent>(
    `/projects/${projectId}/specs/file?${params}`
  );
}

export async function saveSpecsFile(
  projectId: string | number,
  data: {
    path: string;
    content: string;
    branch?: string;
    commitMessage?: string;
    action?: 'create' | 'update';
  }
) {
  return api.put<{ success: boolean; path: string; action: string }>(
    `/projects/${projectId}/specs/file`,
    { body: JSON.stringify(data) }
  );
}

export async function deleteSpecsFile(
  projectId: string | number,
  data: {
    path: string;
    branch?: string;
    commitMessage?: string;
  }
) {
  return api.delete<{ success: boolean; path: string }>(
    `/projects/${projectId}/specs/file`,
    { body: JSON.stringify(data) }
  );
}

export async function commitSpecsFiles(
  projectId: string | number,
  data: {
    branch?: string;
    commitMessage: string;
    actions: FileAction[];
  }
) {
  return api.post<{ success: boolean; commit: SpecCommit }>(
    `/projects/${projectId}/specs/commit`,
    { body: JSON.stringify(data) }
  );
}

export async function getSpecsCommits(
  projectId: string | number,
  params?: {
    path?: string;
    ref?: string;
    perPage?: number;
    page?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.path) searchParams.set('path', params.path);
  if (params?.ref) searchParams.set('ref', params.ref);
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));
  if (params?.page) searchParams.set('page', String(params.page));
  return api.get<{ commits: SpecCommit[] }>(
    `/projects/${projectId}/specs/commits?${searchParams}`
  );
}

export async function getSpecsCommitDetail(
  projectId: string | number,
  sha: string
) {
  return api.get<CommitDetail>(
    `/projects/${projectId}/specs/commits/${sha}`
  );
}

export async function searchSpecs(
  projectId: string | number,
  query: string,
  path?: string,
  ref?: string
) {
  const params = new URLSearchParams({ q: query });
  if (path) params.set('path', path);
  if (ref) params.set('ref', ref);
  return api.get<{ results: FileTreeNode[] }>(
    `/projects/${projectId}/specs/search?${params}`
  );
}
