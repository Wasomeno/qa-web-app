import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSpecsTree,
  getSpecsFile,
  saveSpecsFile,
  deleteSpecsFile,
  commitSpecsFiles,
  getSpecsCommits,
  getSpecsCommitDetail,
  searchSpecs,
  type FileAction,
} from '@/api/specs';

// --- Query Hooks ---

export function useSpecsTree(
  projectId: string | number | undefined,
  path = '',
  ref?: string,
  recursive = false
) {
  return useQuery({
    queryKey: ['specs', 'tree', projectId, path, ref, recursive],
    queryFn: () => getSpecsTree(projectId!, path, ref, recursive),
    enabled: !!projectId,
    select: (data) => data.data?.tree ?? [],
  });
}

export function useSpecsFile(
  projectId: string | number | undefined,
  filePath: string | null,
  ref?: string
) {
  return useQuery({
    queryKey: ['specs', 'file', projectId, filePath, ref],
    queryFn: () => getSpecsFile(projectId!, filePath!, ref),
    enabled: !!projectId && !!filePath,
    select: (data) => data.data ?? null,
  });
}

export function useSpecsCommits(
  projectId: string | number | undefined,
  params?: { path?: string; ref?: string; perPage?: number; page?: number }
) {
  return useQuery({
    queryKey: ['specs', 'commits', projectId, params],
    queryFn: () => getSpecsCommits(projectId!, params),
    enabled: !!projectId,
    select: (data) => data.data?.commits ?? [],
  });
}

export function useSpecsCommitDetail(
  projectId: string | number | undefined,
  sha: string | null
) {
  return useQuery({
    queryKey: ['specs', 'commit', projectId, sha],
    queryFn: () => getSpecsCommitDetail(projectId!, sha!),
    enabled: !!projectId && !!sha,
    select: (data) => data.data ?? null,
  });
}

export function useSearchSpecs(
  projectId: string | number | undefined,
  query: string,
  path?: string,
  ref?: string
) {
  return useQuery({
    queryKey: ['specs', 'search', projectId, query, path, ref],
    queryFn: () => searchSpecs(projectId!, query, path, ref),
    enabled: !!projectId && query.length >= 2,
    select: (data) => data.data?.results ?? [],
  });
}

// --- Mutation Hooks ---

export function useSaveSpecsFile(projectId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      path: string;
      content: string;
      branch?: string;
      commitMessage?: string;
      action?: 'create' | 'update';
    }) => saveSpecsFile(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specs', 'tree', projectId] });
      queryClient.invalidateQueries({ queryKey: ['specs', 'commits', projectId] });
    },
  });
}

export function useDeleteSpecsFile(projectId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      path: string;
      branch?: string;
      commitMessage?: string;
    }) => deleteSpecsFile(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specs', 'tree', projectId] });
      queryClient.invalidateQueries({ queryKey: ['specs', 'commits', projectId] });
    },
  });
}

export function useCommitSpecsFiles(projectId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      branch?: string;
      commitMessage: string;
      actions: FileAction[];
    }) => commitSpecsFiles(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specs', 'tree', projectId] });
      queryClient.invalidateQueries({ queryKey: ['specs', 'commits', projectId] });
    },
  });
}
