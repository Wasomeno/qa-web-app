import { useState, useCallback, useRef } from 'react';
import { getSpecsDirectory, type FileTreeNode } from '@/api/specs';

/**
 * Manages a lazy-loaded file tree. Fetches only the root level initially,
 * then loads subdirectories on demand when expanded.
 */
export function useLazyFileTree(
  projectId: string | number | undefined,
  ref?: string
) {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
  const loadedPaths = useRef<Set<string>>(new Set());

  /** Load the root level of the tree */
  const loadRoot = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getSpecsDirectory(projectId, '', ref);
      const nodes = res.data?.tree ?? [];
      setTree(nodes);
      loadedPaths.current.clear();
      // Mark root-level dirs as needing load (they have no children yet)
    } catch (err) {
      console.error('[lazy-tree] failed to load root:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, ref]);

  /** Load children for a specific directory path */
  const loadChildren = useCallback(
    async (dirPath: string) => {
      if (!projectId || loadedPaths.current.has(dirPath)) return;

      setLoadingPaths((prev) => new Set(prev).add(dirPath));
      try {
        const res = await getSpecsDirectory(projectId, dirPath, ref);
        const children = res.data?.tree ?? [];
        loadedPaths.current.add(dirPath);

        // Insert children into the tree immutably
        setTree((prev) => insertChildren(prev, dirPath, children));
      } catch (err) {
        console.error(`[lazy-tree] failed to load ${dirPath}:`, err);
      } finally {
        setLoadingPaths((prev) => {
          const next = new Set(prev);
          next.delete(dirPath);
          return next;
        });
      }
    },
    [projectId, ref]
  );

  /** Check if a directory's children have been loaded */
  const isLoaded = useCallback(
    (dirPath: string) => loadedPaths.current.has(dirPath),
    []
  );

  /** Reload everything from scratch */
  const refresh = useCallback(async () => {
    loadedPaths.current.clear();
    await loadRoot();
  }, [loadRoot]);

  return {
    tree,
    loading,
    loadingPaths,
    loadRoot,
    loadChildren,
    isLoaded,
    refresh,
  };
}

/** Recursively insert children into the tree at the given path */
function insertChildren(
  nodes: FileTreeNode[],
  dirPath: string,
  children: FileTreeNode[]
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.path === dirPath) {
      return { ...node, children };
    }
    if (node.type === 'tree' && node.children && node.children.length > 0) {
      return { ...node, children: insertChildren(node.children, dirPath, children) };
    }
    return node;
  });
}
