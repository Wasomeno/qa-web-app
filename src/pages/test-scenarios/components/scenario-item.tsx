import React from 'react';
import {
  Play,
  Copy,
  Trash2,
  FileText,
  Settings,
  Key,
  Info,
  Check,
  X,
  Sheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TestScenario } from '@/types/test-scenario';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScenarioItemProps {
  scenario: TestScenario;
  isSelected?: boolean;
  projectName?: string;
  onClick: () => void;
  onGenerate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
  deleteError?: string | null;
}

export const ScenarioItem: React.FC<ScenarioItemProps> = ({
  scenario,
  isSelected,
  projectName,
  onClick,
  onGenerate,
  onDelete,
  isDeleting = false,
  deleteError = null,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  // Derive new status fields with backward-compatible fallbacks
  const processingStatus = scenario.processingStatus ?? 'idle';
  const automationStatus = scenario.automationStatus ?? 'not_generated';
  const stats = scenario.automationStats ?? scenario.stats;

  const isGenerating = processingStatus === 'generating';
  const hasGenerationFailure = processingStatus === 'generation_failed';
  const isRunning = automationStatus === 'running';
  const hasRunFailure = automationStatus === 'failed';

  // Generate badge based on priority order from the guide
  function getScenarioBadge() {
    if (processingStatus === 'generating') {
      return { label: 'Generating', tone: 'neutral' as const };
    }
    if (automationStatus === 'running') {
      return { label: 'Running tests', tone: 'blue' as const };
    }
    if (processingStatus === 'generation_failed') {
      return { label: 'Generation failed', tone: 'red' as const };
    }
    if (automationStatus === 'failed') {
      return { label: 'Run failed', tone: 'red' as const };
    }
    if (automationStatus === 'passed') {
      return { label: 'Passed', tone: 'green' as const };
    }
    if (automationStatus === 'partial') {
      return { label: 'Partially automated', tone: 'amber' as const };
    }
    if (automationStatus === 'idle') {
      return { label: 'Automated', tone: 'zinc' as const };
    }
    return { label: 'Not generated', tone: 'zinc' as const };
  }

  const badge = getScenarioBadge();
  const badgeClasses: Record<string, string> = {
    neutral: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    red: 'bg-red-100 text-red-700 hover:bg-red-100',
    green: 'bg-green-100 text-green-700 hover:bg-green-100',
    amber: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    zinc: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100',
  };

  // Close confirmation dialog when deletion starts
  React.useEffect(() => {
    if (isDeleting) {
      setIsConfirmingDelete(false);
    }
  }, [isDeleting]);

  const totalTestCases = stats?.totalTestCases ?? scenario.stats?.totalTestCases ?? (scenario.sections || []).reduce(
    (acc, section) => acc + (section.testCases?.length || 0),
    0
  );
  const generatedCount = stats?.generatedCount ?? stats?.automatedCount ?? 0;
  const coveragePercent = stats?.coveragePercent ?? 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-all duration-200',
        'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm h-full relative',
        isSelected && 'ring-2 ring-zinc-900 border-transparent shadow-md'
      )}
    >
      {isConfirmingDelete && (
        <div
          className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200"
          onClick={e => e.stopPropagation()}
        >
          {isDeleting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-8 h-8 text-zinc-600 mb-2" />
              </motion.div>
              <p className="text-sm font-semibold text-zinc-900 mb-1">
                Deleting...
              </p>
              <p className="text-xs text-zinc-500">
                Please wait while we remove this scenario.
              </p>
            </>
          ) : deleteError ? (
            <>
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm font-bold text-gray-900 mb-1">
                Failed to delete
              </p>
              <p className="text-xs text-red-600 mb-4 max-w-[200px]">
                {deleteError}
              </p>
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-xs"
                  onClick={e => {
                    e.stopPropagation();
                    setIsConfirmingDelete(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-9 text-xs bg-red-600 hover:bg-red-700"
                  onClick={onDelete}
                >
                  Retry
                </Button>
              </div>
            </>
          ) : (
            <>
              <Trash2 className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm font-bold text-gray-900 mb-1">
                Delete this test scenario?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-xs"
                  onClick={e => {
                    e.stopPropagation();
                    setIsConfirmingDelete(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-9 text-xs bg-red-600 hover:bg-red-700"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-zinc-900 truncate"
              title={scenario.title}
            >
              {scenario.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
              <span className="truncate">
                {formatDistanceToNow(new Date(scenario.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {scenario.sourceDisplay && (
                <span className="flex items-center gap-1 text-zinc-400 truncate max-w-[200px]">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{scenario.sourceDisplay}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      isDeleting 
                        ? "text-zinc-400 cursor-not-allowed" 
                        : "text-zinc-500 hover:text-red-600 hover:bg-red-50"
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      if (!isDeleting) {
                        setIsConfirmingDelete(true);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isDeleting ? 'Deleting...' : 'Delete Wrapper'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      isDeleting
                        ? "text-zinc-300 cursor-not-allowed"
                        : "text-zinc-500 hover:text-zinc-600 hover:bg-zinc-50"
                    )}
                    onClick={onGenerate}
                    disabled={isDeleting}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate Scripts</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-1.5" title="Total Sections">
            <FileText className="w-4 h-4" />
            <span>{stats?.totalSections ?? (scenario.sections || []).length} sections</span>
          </div>
          <div className="flex items-center gap-1.5" title="Total Test Cases">
            <Info className="w-4 h-4" />
            <span>{totalTestCases} test cases</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title="Automated Test Cases"
          >
            <Settings className="w-4 h-4" />
            <span>{generatedCount} automated</span>
          </div>
        </div>

        {/* Stats badges row */}
        {(stats?.generatingCount || stats?.runningCount || stats?.passCount || stats?.failCount || stats?.generationFailedCount) ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {stats?.generatingCount ? <Badge variant="secondary" className="text-[10px] bg-zinc-100 text-zinc-700">{stats.generatingCount} generating</Badge> : null}
            {stats?.runningCount ? <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">{stats.runningCount} running</Badge> : null}
            {stats?.coveragePercent ? <Badge variant="secondary" className="text-[10px] bg-zinc-100 text-zinc-600">{stats.coveragePercent}% coverage</Badge> : null}
            {stats?.passCount ? <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">{stats.passCount} passed</Badge> : null}
            {stats?.failCount ? <Badge variant="destructive" className="text-[10px]">{stats.failCount} failed</Badge> : null}
            {stats?.generationFailedCount ? <Badge variant="destructive" className="text-[10px]">{stats.generationFailedCount} gen. failed</Badge> : null}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <Badge
            variant="secondary"
            className={cn(
              'capitalize font-medium text-xs',
              badgeClasses[badge.tone]
            )}
          >
            {isGenerating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {isRunning && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
            {badge.label}
          </Badge>

          <div
            className="flex items-center gap-2 text-xs text-zinc-500 min-w-0"
            title={scenario.projectName || projectName || 'Unassigned Project'}
          >
            <span className="truncate">
              {scenario.projectName || projectName || 'Unassigned'}
            </span>
          </div>
        </div>

        {(hasGenerationFailure || hasRunFailure) && scenario.error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md">
            {scenario.error}
          </div>
        )}
      </div>
    </div>
  );
};
