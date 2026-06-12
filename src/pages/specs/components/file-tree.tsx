import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Folder,
  FolderOpen,
  Search,
  RefreshCw,
  File,
  FileCode,
  FileImage,
  FileType,
  Loader2,
  CheckSquare2,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileTreeNode } from '@/api/specs';

interface FileTreeProps {
  nodes: FileTreeNode[];
  activePath: string | null;
  onSelect: (path: string) => void;
  /** Called when a directory is expanded — used for lazy loading children */
  onExpand?: (dirPath: string) => void;
  /** Set of directory paths currently being loaded */
  loadingPaths?: Set<string>;
  /** Check if a directory's children have been loaded */
  isLoaded?: (dirPath: string) => boolean;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
  selectionMode?: boolean;
  selectedPaths?: Set<string>;
  onToggleSelect?: (path: string) => void;
  isSelectableFile?: (node: FileTreeNode) => boolean;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md':
    case 'markdown':
      return <FileType className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'json':
    case 'yaml':
    case 'yml':
      return <FileCode className="h-3.5 w-3.5 shrink-0 text-stone-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="h-3.5 w-3.5 shrink-0 text-zinc-400" />;
    default:
      return <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />;
  }
}

function filterFileTreeNodes(nodes: FileTreeNode[], query: string): FileTreeNode[] {
  if (!query) return nodes;
  const lower = query.toLowerCase();
  return nodes
    .map((node) => {
      if (node.type === 'tree') {
        const filteredChildren = filterFileTreeNodes(node.children || [], query);
        const nameMatch = node.name.toLowerCase().includes(lower);
        if (nameMatch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      if (
        node.name.toLowerCase().includes(lower) ||
        node.path.toLowerCase().includes(lower)
      ) {
        return node;
      }
      return null;
    })
    .filter(Boolean) as FileTreeNode[];
}

export function FileTree({
  nodes,
  activePath,
  onSelect,
  onExpand,
  loadingPaths,
  isLoaded,
  loading,
  onRefresh,
  className,
  selectionMode = false,
  selectedPaths = new Set(),
  onToggleSelect,
  isSelectableFile,
}: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = useCallback(
    (path: string) => {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        const willExpand = !next.has(path);
        if (willExpand) {
          next.add(path);
          // Trigger lazy load if children not yet loaded
          if (onExpand && (!isLoaded || !isLoaded(path))) {
            onExpand(path);
          }
        } else {
          next.delete(path);
        }
        return next;
      });
    },
    [onExpand, isLoaded]
  );

  const filteredNodes = useMemo(
    () => filterFileTreeNodes(nodes, searchQuery),
    [nodes, searchQuery]
  );

  const fileCount = useMemo(() => {
    const count = (nodes: FileTreeNode[]): number =>
      nodes.reduce(
        (acc, n) => acc + (n.type === 'blob' ? 1 : count(n.children || [])),
        0
      );
    return count(nodes);
  }, [nodes]);

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Search */}
      <div className="px-3 py-2.5 border-b border-border/50">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border/50 bg-muted/30 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50">Loading files...</span>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2">
            <Search className="h-5 w-5 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/50">
              {searchQuery ? 'No matching files' : 'No files found'}
            </span>
          </div>
        ) : (
          <TreeNodeList
            nodes={filteredNodes}
            activePath={activePath}
            expandedPaths={expandedPaths}
            onToggle={toggleExpand}
            onSelect={onSelect}
            loadingPaths={loadingPaths}
            depth={0}
            selectionMode={selectionMode}
            selectedPaths={selectedPaths}
            onToggleSelect={onToggleSelect}
            isSelectableFile={isSelectableFile}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
          {fileCount} files
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-muted-foreground/40 hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted/50"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          </button>
        )}
      </div>
    </div>
  );
}

function TreeNodeList({
  nodes,
  activePath,
  expandedPaths,
  onToggle,
  onSelect,
  loadingPaths,
  depth,
  selectionMode,
  selectedPaths,
  onToggleSelect,
  isSelectableFile,
}: {
  nodes: FileTreeNode[];
  activePath: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  loadingPaths?: Set<string>;
  depth: number;
  selectionMode: boolean;
  selectedPaths: Set<string>;
  onToggleSelect?: (path: string) => void;
  isSelectableFile?: (node: FileTreeNode) => boolean;
}) {
  return (
    <div>
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          activePath={activePath}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onSelect={onSelect}
          loadingPaths={loadingPaths}
          depth={depth}
          selectionMode={selectionMode}
          selectedPaths={selectedPaths}
          onToggleSelect={onToggleSelect}
          isSelectableFile={isSelectableFile}
        />
      ))}
    </div>
  );
}

function TreeNodeItem({
  node,
  activePath,
  expandedPaths,
  onToggle,
  onSelect,
  loadingPaths,
  depth,
  selectionMode,
  selectedPaths,
  onToggleSelect,
  isSelectableFile,
}: {
  node: FileTreeNode;
  activePath: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  loadingPaths?: Set<string>;
  depth: number;
  selectionMode: boolean;
  selectedPaths: Set<string>;
  onToggleSelect?: (path: string) => void;
  isSelectableFile?: (node: FileTreeNode) => boolean;
}) {
  const isExpanded = expandedPaths.has(node.path);
  const isActive = activePath === node.path;
  const isDir = node.type === 'tree';
  const isLoadingChildren = loadingPaths?.has(node.path) ?? false;
  const hasChildren = node.children && node.children.length > 0;
  const canSelect = !isDir && selectionMode && (isSelectableFile?.(node) ?? true);
  const isSelected = canSelect && selectedPaths.has(node.path);

  return (
    <div className="py-0.5">
      <button
        className={cn(
          'flex h-8 items-center w-full text-left py-1 text-[13px] rounded-md mx-1.5 transition-colors duration-150 group relative overflow-hidden',
          isSelected
            ? 'bg-muted/80 text-foreground font-semibold ring-1 ring-border/70'
            : isActive
            ? 'bg-muted text-foreground/90 font-medium'
            : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
          selectionMode && !isDir && !canSelect && 'opacity-45'
        )}
        style={{ width: `calc(100% - 12px)`, paddingLeft: `${depth * 14 + 10}px` }}
        onClick={() => {
          if (isDir) onToggle(node.path);
          else if (canSelect) onToggleSelect?.(node.path);
          else onSelect(node.path);
        }}
        aria-pressed={canSelect ? isSelected : undefined}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="active-file"
            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-foreground/70"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        {isDir ? (
          <>
            <span
              className={cn(
                'mr-1 flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-200',
                isExpanded && 'rotate-0',
                !isExpanded && '-rotate-90'
              )}
            >
              {isLoadingChildren ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0" />
              )}
            </span>
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 mr-1.5 shrink-0 text-muted-foreground/70" />
            ) : (
              <Folder className="h-4 w-4 mr-1.5 shrink-0 text-muted-foreground/50" />
            )}
          </>
        ) : (
          <>
            {selectionMode ? (
              <span className="mr-2 flex h-4 w-4 shrink-0 items-center justify-center">
                {canSelect ? (
                  isSelected ? (
                    <CheckSquare2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-muted-foreground/55" />
                  )
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
              </span>
            ) : (
              <span className="mr-1.5 h-4 w-4 shrink-0" />
            )}
            <span className="mr-2 flex h-4 w-4 shrink-0 items-center justify-center">
              {getFileIcon(node.name)}
            </span>
          </>
        )}
        <span className="min-w-0 truncate leading-tight">{node.name}</span>
      </button>

      <AnimatePresence initial={false}>
        {isDir && isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <TreeNodeList
              nodes={node.children!}
              activePath={activePath}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelect={onSelect}
              loadingPaths={loadingPaths}
              depth={depth + 1}
              selectionMode={selectionMode}
              selectedPaths={selectedPaths}
              onToggleSelect={onToggleSelect}
              isSelectableFile={isSelectableFile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
