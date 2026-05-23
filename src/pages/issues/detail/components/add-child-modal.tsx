import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectIssues, Issue } from '@/api/issue';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/utils/useDebounce';
import { Button } from '@/components/ui/button';
import { ChildIssueFormFields } from './child-issue-form-fields';
import { IssueFormState } from '@/pages/issues/create/components/issue-form-fields';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (issue: Issue) => void;
  onCreate: (formState: IssueFormState) => void;
  parentIssue: Issue;
  portalContainer?: HTMLElement | null;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onCreate,
  parentIssue,
  portalContainer,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'create'>('link');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [formState, setFormState] = useState<IssueFormState>({
    title: '',
    description: '',
    selectedProject: { id: parentIssue.project_id },
    selectedLabels: [],
    selectedAssignee: null,
  });
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormState({
        title: '',
        description: '',
        selectedProject: { id: parentIssue.project_id },
        selectedLabels: [],
        selectedAssignee: null,
      });
    }
  }, [isOpen, parentIssue.project_id]);

  // Fetch issues for search
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search-issues', parentIssue.project_id, debouncedSearch],
    queryFn: () =>
      getProjectIssues(parentIssue.project_id, { search: debouncedSearch }),
    enabled: isOpen && activeTab === 'link' && debouncedSearch.length > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredIssues = (searchResults?.data || [])
    .filter(issue => issue.id !== parentIssue.id)
    .slice(0, 5);

  const handleLink = async (issue: Issue) => {
    try {
      setStatus('submitting');
      await onAdd(issue);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } catch (err) {
      setStatus('error');
      setErrorMessage('Failed to link issue');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) return;

    try {
      setStatus('submitting');
      await onCreate(formState);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } catch (err) {
      setStatus('error');
      setErrorMessage('Failed to create issue');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const isCreateTab = activeTab === 'create';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full flex flex-col min-h-[60%] max-h-[85vh] max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Add Child Task
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-2 border-b border-border">
              <button
                onClick={() => setActiveTab('link')}
                className={cn(
                  'px-4 py-3 text-xs font-medium border-b-2 transition-all relative',
                  activeTab === 'link'
                    ? 'text-foreground border-foreground'
                    : 'text-muted-foreground border-transparent hover:text-foreground/80'
                )}
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-3" />
                  Link Existing
                </div>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={cn(
                  'px-4 py-3 text-xs font-medium border-b-2 transition-all relative',
                  activeTab === 'create'
                    ? 'text-foreground border-foreground'
                    : 'text-muted-foreground border-transparent hover:text-foreground/80'
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus className="size-3" />
                  Create New
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-1 flex-col min-h-0">
              {activeTab === 'link' ? (
                <div className="flex flex-1 flex-col space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2">
                    {filteredIssues.length > 0 ? (
                      <div className="space-y-1">
                        {filteredIssues.map(issue => (
                          <button
                            key={issue.id}
                            onClick={() => handleLink(issue)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                                #{issue.iid}
                              </span>
                              <span className="text-sm text-foreground/80 truncate font-medium">
                                {issue.title}
                              </span>
                            </div>
                            <Plus className="w-4 h-4 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1 items-center justify-center py-8 text-center bg-muted/50 rounded-2xl border border-dashed border-border">
                        {isSearching ? (
                          <Loader2 className="w-8 h-8 text-muted-foreground/30 mx-auto animate-spin" />
                        ) : (
                          <>
                            <AlertCircle className="size-6 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">
                              No issues found
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <form className="space-y-4 px-0.5" onSubmit={handleCreate}>
                    <ChildIssueFormFields
                      formState={formState}
                      onChange={updates =>
                        setFormState(prev => ({ ...prev, ...updates }))
                      }
                      projectId={parentIssue.project_id}
                      portalContainer={portalContainer}
                    />

                    {status === 'error' && (
                      <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive leading-relaxed">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t gap-4 border-border flex justify-end">
              <AnimatePresence>
                {isCreateTab && (
                  <Button
                    onClick={handleCreate}
                    disabled={
                      !formState.title.trim() || status === 'submitting'
                    }
                    className={cn(
                      'flex text-xs items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all',
                      status === 'success'
                        ? 'bg-success text-white'
                        : status === 'error'
                          ? 'bg-destructive text-white'
                          : 'bg-foreground hover:bg-foreground/90 disabled:bg-muted disabled:cursor-not-allowed text-muted-foreground/80'
                    )}
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : status === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Created Successfully
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Child Issue
                      </>
                    )}
                  </Button>
                )}
              </AnimatePresence>

              <Button
                variant="destructive"
                onClick={onClose}
                className="px-4 py-2 text-xs text-destructive font-medium bg-transparent hover:bg-destructive/10 hover:text-destructive duration-200 rounded-xl transition-all"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
