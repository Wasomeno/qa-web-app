import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  GripVertical,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  Play,
  Square,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Layers,
  Hash,
  Tag,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  AlertCircle,
  FileSpreadsheet,
  Target,
  Calendar,
  ExternalLink,
  Pencil,
  Check,
  Filter,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  TestScenario,
  TestSection,
  TestCase,
  TestStep,
  Priority,
  TestCaseStatus,
  AutomationStatus,
} from '@/types/test-scenario';
import { testScenarioApi } from '@/api/test-scenario';

// ─────────────────────────────────────────────
// Inline Edit Field
// ─────────────────────────────────────────────
interface InlineFieldProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

const InlineField: React.FC<InlineFieldProps> = ({
  value,
  onChange,
  multiline = false,
  className,
  placeholder = 'Click to edit…',
  inputClassName,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const save = () => {
    onChange(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      cancel();
    }
  };

  if (!editing) {
    const isEmpty = !value || value.trim().length === 0;
    return (
      <div
        onClick={startEdit}
        className={cn(
          'cursor-text group relative rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-zinc-50',
          isEmpty && 'italic text-zinc-400',
          className
        )}
      >
        <span className={isEmpty ? '' : ''}>{isEmpty ? placeholder : value}</span>
        <Pencil className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2 transition-opacity" />
      </div>
    );
  }

  const sharedProps = {
    ref: inputRef as any,
    value: draft,
    onChange: (e: React.ChangeEvent<any>) => setDraft(e.target.value),
    onBlur: save,
    onKeyDown: handleKeyDown,
    className: cn(
      'w-full bg-white border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 rounded-md text-inherit',
      multiline ? 'min-h-[60px] resize-y py-1.5 px-2 text-sm leading-relaxed' : 'h-7 py-0.5 px-2 text-sm',
      inputClassName
    ),
  };

  return multiline ? <Textarea {...sharedProps} /> : <Input {...sharedProps} />;
};

// ─────────────────────────────────────────────
// Priority Badge + Selector
// ─────────────────────────────────────────────
const PRIORITY_META: Record<Priority, { label: string; classes: string }> = {
  low: { label: 'Low', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
  medium: { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  high: { label: 'High', classes: 'bg-orange-50 text-orange-700 border-orange-100' },
  critical: { label: 'Critical', classes: 'bg-red-50 text-red-700 border-red-100' },
};

const PriorityBadge: React.FC<{
  priority: Priority;
  onChange?: (p: Priority) => void;
}> = ({ priority, onChange }) => {
  const meta = PRIORITY_META[priority];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onChange && setOpen(v => !v)}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border transition-opacity',
          meta.classes,
          onChange ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
        )}
      >
        {meta.label}
      </button>
      {open && onChange && (
        <div className="absolute z-50 mt-1 w-28 bg-white border border-zinc-200 rounded-lg shadow-lg py-1">
          {(Object.keys(PRIORITY_META) as Priority[]).map((p: Priority) => (
            <button
              key={p}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 transition-colors flex items-center justify-between',
                p === priority && 'bg-zinc-50'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', PRIORITY_META[p].classes.split(' ')[1].replace('text-', 'bg-'))} />
              {PRIORITY_META[p].label}
              {p === priority && <Check className="w-3 h-3 text-zinc-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Status Badge + Selector
// ─────────────────────────────────────────────
const STATUS_META: Record<TestCaseStatus, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-slate-50 text-slate-600 border-slate-200' },
  ready: { label: 'Ready', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  blocked: { label: 'Blocked', classes: 'bg-red-50 text-red-700 border-red-100' },
  deprecated: { label: 'Deprecated', classes: 'bg-zinc-100 text-zinc-500 border-zinc-200 line-through' },
};

const StatusBadge: React.FC<{
  status: TestCaseStatus;
  onChange?: (s: TestCaseStatus) => void;
}> = ({ status, onChange }) => {
  const meta = STATUS_META[status];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onChange && setOpen(v => !v)}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border transition-opacity',
          meta.classes,
          onChange ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
        )}
      >
        {meta.label}
      </button>
      {open && onChange && (
        <div className="absolute z-50 mt-1 w-28 bg-white border border-zinc-200 rounded-lg shadow-lg py-1">
          {(Object.keys(STATUS_META) as TestCaseStatus[]).map((s: TestCaseStatus) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 transition-colors flex items-center justify-between',
                s === status && 'bg-zinc-50'
              )}
            >
              {STATUS_META[s].label}
              {s === status && <Check className="w-3 h-3 text-zinc-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Automation Badge
// ─────────────────────────────────────────────
const AutomationBadge: React.FC<{
  test?: { status: AutomationStatus; name: string; lastRunAt?: string };
  onClick?: () => void;
}> = ({ test, onClick }) => {
  if (!test) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-50 text-zinc-400 border border-zinc-200">
        <Clock className="w-3 h-3" />
        No automation
      </span>
    );
  }

  const meta: Record<AutomationStatus, { icon: React.ReactNode; classes: string }> = {
    idle: { icon: <Clock className="w-3 h-3" />, classes: 'bg-zinc-50 text-zinc-500 border-zinc-200' },
    running: { icon: <Loader2 className="w-3 h-3 animate-spin" />, classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    pass: { icon: <CheckCircle2 className="w-3 h-3" />, classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    fail: { icon: <XCircle className="w-3 h-3" />, classes: 'bg-red-50 text-red-700 border-red-100' },
  };

  const m = meta[test.status];
  const timeAgo = test.lastRunAt
    ? `${Math.max(1, Math.round((Date.now() - new Date(test.lastRunAt).getTime()) / 60000))}m`
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-opacity hover:opacity-80',
        m.classes,
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
    >
      {m.icon}
      {test.status === 'pass' ? 'Pass' : test.status === 'fail' ? 'Fail' : test.status === 'running' ? 'Running' : 'Idle'}
      {timeAgo && <span className="opacity-60">· {timeAgo}</span>}
    </button>
  );
};

// ─────────────────────────────────────────────
// Last Run Panel (rich automation test details)
// ─────────────────────────────────────────────
const LastRunPanel: React.FC<{
  test: {
    status: AutomationStatus;
    name: string;
    lastRunAt?: string;
    runDurationMs?: number;
    videoUrl?: string;
    stepResults?: { stepIndex: number; status: string; error?: string }[];
    log?: string;
    errorMessage?: string;
    failedStepIndex?: number;
  };
}> = ({ test }) => {
  const isPass = test.status === 'pass';
  const isFail = test.status === 'fail';

  const timeAgo = test.lastRunAt
    ? (() => {
        const mins = Math.round((Date.now() - new Date(test.lastRunAt).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.round(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.round(hrs / 24);
        return `${days}d ago`;
      })()
    : null;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        isPass
          ? 'bg-emerald-50/40 border-emerald-100'
          : isFail
          ? 'bg-red-50/40 border-red-100'
          : 'bg-zinc-50 border-zinc-100'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between',
          isPass && 'border-b border-emerald-100/60',
          isFail && 'border-b border-red-100/60',
          !isPass && !isFail && 'border-b border-zinc-100'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center',
              isPass && 'bg-emerald-100 text-emerald-700',
              isFail && 'bg-red-100 text-red-700',
              !isPass && !isFail && 'bg-zinc-100 text-zinc-500'
            )}
          >
            {isPass ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isFail ? (
              <XCircle className="w-4 h-4" />
            ) : test.status === 'running' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
          <div>
            <p
              className={cn(
                'text-sm font-semibold',
                isPass && 'text-emerald-800',
                isFail && 'text-red-800',
                !isPass && !isFail && 'text-zinc-700'
              )}
            >
              {isPass ? 'Passed' : isFail ? 'Failed' : test.status === 'running' ? 'Running' : 'Not Run'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
              {timeAgo && <span>{timeAgo}</span>}
              {test.runDurationMs && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>{(test.runDurationMs / 1000).toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      {test.videoUrl && (
        <div className="px-4 py-3 border-b border-zinc-100">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Recording
          </p>
          <video
            src={test.videoUrl}
            controls
            className="w-full rounded-lg bg-zinc-900 max-h-[200px]"
          />
        </div>
      )}

      {/* Step Results */}
      {test.stepResults && test.stepResults.length > 0 && (
        <div className="px-4 py-3 border-b border-zinc-100">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Step Results
          </p>
          <div className="space-y-1.5">
            {test.stepResults.map((sr) => (
              <div
                key={sr.stepIndex}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs',
                  sr.status === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                <span className="font-mono text-[10px] w-5">{sr.stepIndex + 1}</span>
                <span className="flex-1">{sr.status === 'success' ? 'Passed' : 'Failed'}</span>
                {sr.error && <span className="text-[10px] opacity-80 truncate max-w-[200px]">{sr.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log */}
      {test.log && (
        <div className="px-4 py-3 border-b border-zinc-100">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Log
          </p>
          <pre className="text-[11px] text-zinc-600 bg-zinc-100 rounded-md p-2.5 overflow-auto max-h-[120px] whitespace-pre-wrap">
            {test.log}
          </pre>
        </div>
      )}

      {/* Error message */}
      {isFail && test.errorMessage && (
        <div className="px-4 py-3 bg-red-50/60 border-b border-red-100/60">
          <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1.5">
            Failure Details
          </p>
          <p className="text-sm text-red-800 leading-relaxed">{test.errorMessage}</p>
          {test.failedStepIndex !== undefined && (
            <p className="text-xs text-red-600 mt-1.5">
              Failed at step {test.failedStepIndex + 1}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Test Case Detail Modal
// ─────────────────────────────────────────────
const TestCaseDetailModal: React.FC<{
  testCase: TestCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ testCase, open, onOpenChange }) => {
  const at = testCase.automationTest;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
              {testCase.code}
            </span>
            <DialogTitle className="text-base">{testCase.title}</DialogTitle>
          </div>
          {testCase.description && (
            <DialogDescription>{testCase.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {testCase.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            <PriorityBadge priority={testCase.priority} />
            <StatusBadge status={testCase.status} />
            {at && <AutomationBadge test={at} />}
          </div>

          {/* Precondition */}
          {testCase.preCondition && (
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Precondition
              </h4>
              <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                {testCase.preCondition}
              </p>
            </div>
          )}

          {/* Manual Steps */}
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Test Steps
            </h4>
            <div className="space-y-2">
              {testCase.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 text-sm bg-zinc-50 rounded-lg px-3 py-2.5 border border-zinc-100"
                >
                  <span className="shrink-0 font-mono text-[10px] text-zinc-400 w-5 mt-0.5">
                    {step.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-800 font-medium">{step.action}</p>
                    {step.data && <p className="text-zinc-500 text-xs mt-0.5">Data: {step.data}</p>}
                    <p className="text-zinc-500 text-xs mt-0.5">Expected: {step.expected}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation */}
          {at && (
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Automation Test
              </h4>
              <LastRunPanel test={at} />

              {/* Generated automation steps */}
              {at.steps && at.steps.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Generated Steps
                  </p>
                  <div className="space-y-1.5">
                    {at.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs bg-zinc-50 rounded-md px-2.5 py-2 border border-zinc-100"
                      >
                        <span className="shrink-0 font-mono text-[10px] text-zinc-400 w-4">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-zinc-700">{step.action}</span>
                          {step.description && (
                            <span className="text-zinc-500 ml-1">— {step.description}</span>
                          )}
                          {step.selector && (
                            <code className="block text-[10px] text-zinc-400 mt-0.5 truncate">
                              {step.selector}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          {testCase.note && (
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Note
              </h4>
              <p className="text-sm text-zinc-600">{testCase.note}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
// Step Item (with inline edit and reorder)
// ─────────────────────────────────────────────
const StepItem: React.FC<{
  step: TestStep;
  isFirst: boolean;
  isLast: boolean;
  onChange: (s: TestStep) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ step, isFirst, isLast, onChange, onMoveUp, onMoveDown }) => {
  return (
    <div className="flex gap-3 group/step">
      {/* Number + reorder */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold flex items-center justify-center border border-zinc-200/60 shrink-0">
          {step.order}
        </div>
        <div className="flex flex-col mt-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 disabled:opacity-0"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 disabled:opacity-0"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="bg-white rounded-lg border border-zinc-100 p-3 hover:border-zinc-200 transition-colors">
          <div className="text-sm text-zinc-900 leading-snug">
            <InlineField
              value={step.action}
              onChange={v => onChange({ ...step, action: v })}
              inputClassName="font-medium"
            />
          </div>
          {step.data && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500">
              <span className="font-medium text-zinc-400 shrink-0">Input:</span>
              <InlineField
                value={step.data}
                onChange={v => onChange({ ...step, data: v })}
                inputClassName="text-xs"
              />
            </div>
          )}
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400 shrink-0">Expected:</span>
            <InlineField
              value={step.expected}
              onChange={v => onChange({ ...step, expected: v })}
              inputClassName="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Test Run Simulator
// ─────────────────────────────────────────────
type RunPhase = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

interface TestRunState {
  testCaseId: string;
  phase: RunPhase;
  currentStepIndex: number;
  completedStepIds: Set<string>;
  result: 'pass' | 'fail' | null;
  errorMessage?: string;
}

function useTestRunner(
  scenarioId: string,
  sectionId: string,
  testCase: TestCase,
  state: TestRunState | null,
  onUpdateState: React.Dispatch<React.SetStateAction<TestRunState | null>>,
  onTestCaseUpdate: (tc: TestCase) => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // If the test case is already running when the component mounts, start polling
  React.useEffect(() => {
    if (
      testCase.automationTest?.status === 'running' &&
      (!state || state.testCaseId !== testCase.id)
    ) {
      onUpdateState({
        testCaseId: testCase.id,
        phase: 'running',
        currentStepIndex: 0,
        completedStepIds: new Set(),
        result: null,
      });

      intervalRef.current = setInterval(async () => {
        try {
          const scenario = await testScenarioApi.getScenario(scenarioId);
          const section = scenario.sections?.find(s => s.id === sectionId);
          const updatedTc = section?.testCases.find(tc => tc.id === testCase.id);

          if (updatedTc?.automationTest && updatedTc.automationTest.status !== 'running') {
            clearPolling();
            onTestCaseUpdate(updatedTc);
            onUpdateState(prev => {
              if (!prev || prev.testCaseId !== testCase.id) return prev;
              return {
                ...prev,
                phase: 'completed',
                result: updatedTc.automationTest!.status === 'pass' ? 'pass' : 'fail',
              };
            });
            setTimeout(() => onUpdateState(null), 800);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }

    return () => clearPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(async () => {
    clearPolling();

    onUpdateState({
      testCaseId: testCase.id,
      phase: 'running',
      currentStepIndex: 0,
      completedStepIds: new Set(),
      result: null,
    });

    try {
      await testScenarioApi.runScenarioTestCase(scenarioId, sectionId, testCase.id);
    } catch (err) {
      console.error('Failed to start test:', err);
      onUpdateState(prev => {
        if (!prev || prev.testCaseId !== testCase.id) return prev;
        return {
          ...prev,
          phase: 'completed',
          result: 'fail',
          errorMessage: err instanceof Error ? err.message : 'Failed to start test execution',
        };
      });
      setTimeout(() => onUpdateState(null), 2000);
      return;
    }

    // Start polling for completion
    intervalRef.current = setInterval(async () => {
      try {
        const scenario = await testScenarioApi.getScenario(scenarioId);
        const section = scenario.sections?.find(s => s.id === sectionId);
        const updatedTc = section?.testCases.find(tc => tc.id === testCase.id);

        if (updatedTc?.automationTest && updatedTc.automationTest.status !== 'running') {
          clearPolling();
          onTestCaseUpdate(updatedTc);
          onUpdateState(prev => {
            if (!prev || prev.testCaseId !== testCase.id) return prev;
            return {
              ...prev,
              phase: 'completed',
              result: updatedTc.automationTest!.status === 'pass' ? 'pass' : 'fail',
            };
          });
          setTimeout(() => onUpdateState(null), 800);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  }, [scenarioId, sectionId, testCase, onUpdateState, onTestCaseUpdate, clearPolling]);

  const cancel = useCallback(() => {
    clearPolling();
    onUpdateState(prev => (prev ? { ...prev, phase: 'cancelled' } : prev));
    setTimeout(() => onUpdateState(null), 800);
  }, [onUpdateState, clearPolling]);

  React.useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return { start, cancel };
}

// ─────────────────────────────────────────────
// Test Run Panel (AI-agent style progress)
// ─────────────────────────────────────────────
const TestRunPanel: React.FC<{
  testCase: TestCase;
  runState: TestRunState;
  onCancel: () => void;
}> = ({ testCase, runState, onCancel }) => {
  const isRunning = runState.phase === 'running';
  const isCompleted = runState.phase === 'completed';
  const isCancelled = runState.phase === 'cancelled';

  const message = isCompleted
    ? runState.result === 'pass'
      ? 'All steps completed successfully.'
      : 'Test failed. See details below.'
    : isCancelled
    ? 'Run cancelled by user.'
    : 'Running automation steps…';

  const progressPct =
    testCase.steps.length > 0
      ? Math.round((runState.completedStepIds.size / testCase.steps.length) * 100)
      : 0;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        isCompleted && runState.result === 'pass'
          ? 'bg-emerald-50/40 border-emerald-100'
          : isCompleted && runState.result === 'fail'
          ? 'bg-red-50/40 border-red-100'
          : isCancelled
          ? 'bg-zinc-50 border-zinc-200'
          : 'bg-amber-50/30 border-amber-100'
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
              isRunning && 'bg-amber-100 text-amber-700',
              isCompleted && runState.result === 'pass' && 'bg-emerald-100 text-emerald-700',
              isCompleted && runState.result === 'fail' && 'bg-red-100 text-red-700',
              isCancelled && 'bg-zinc-100 text-zinc-400'
            )}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted && runState.result === 'pass' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isCompleted && runState.result === 'fail' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">
              {isRunning
                ? 'Running Automation Test'
                : isCompleted
                ? runState.result === 'pass'
                  ? 'Passed'
                  : 'Failed'
                : 'Cancelled'}
            </p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">{message}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50"
              onClick={onCancel}
              title="Cancel"
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-amber-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-zinc-400">
              {runState.completedStepIds.size} of {testCase.steps.length} steps
            </span>
            <span className="text-[10px] text-zinc-400">{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Step list */}
      <div className="px-4 pb-4 space-y-1.5">
        {testCase.steps.map((step, idx) => {
          const isCompleted = runState.completedStepIds.has(step.id);
          const isCurrent = isRunning && idx === runState.currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all',
                isCurrent && 'bg-amber-50 border border-amber-100',
                isCompleted && !isCurrent && 'text-zinc-500',
                !isCompleted && !isCurrent && 'text-zinc-300'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center shrink-0 border',
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-zinc-50 border-zinc-100 text-zinc-300'
                )}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <span className="text-[9px] font-medium">{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'truncate flex-1',
                  isCurrent && 'font-medium text-zinc-900',
                  isCompleted && 'line-through opacity-70'
                )}
              >
                {step.action}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Run Button (triggers test execution)
// ─────────────────────────────────────────────
const RunButton: React.FC<{
  testCase: TestCase;
  runState: TestRunState | null;
  onStart: () => void;
  onCancel: () => void;
}> = ({ testCase, runState, onStart, onCancel }) => {
  const isThisRunning =
    runState?.testCaseId === testCase.id && runState.phase === 'running';

  if (isThisRunning) {
    return (
      <div className="flex items-center gap-1">
        <div className="h-7 w-7 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-md text-red-500 hover:bg-red-50"
          onClick={e => {
            e.stopPropagation();
            onCancel();
          }}
          title="Cancel"
        >
          <Square className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  const hasAutomation = !!testCase.automationTest;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-7 w-7 p-0 rounded-md transition-colors',
        hasAutomation
          ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
          : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
      )}
      onClick={e => {
        e.stopPropagation();
        onStart();
      }}
      title={hasAutomation ? 'Re-run test' : 'Run test'}
    >
      {hasAutomation ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
    </Button>
  );
};

// ─────────────────────────────────────────────
// Sortable Test Case Wrapper
// ─────────────────────────────────────────────
const SortableTestCase: React.FC<{
  scenarioId: string;
  sectionId: string;
  testCase: TestCase;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (tc: TestCase) => void;
  runState: TestRunState | null;
  onRunStateChange: React.Dispatch<React.SetStateAction<TestRunState | null>>;
}> = ({ scenarioId, sectionId, testCase, isExpanded, onToggle, onUpdate, runState, onRunStateChange }) => {
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testCase.id });

  const runner = useTestRunner(
    scenarioId,
    sectionId,
    testCase,
    runState?.testCaseId === testCase.id ? runState : null,
    onRunStateChange,
    updatedTc => {
      onUpdate(updatedTc);
    }
  );

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleStepChange = (idx: number, updated: TestStep) => {
    const newSteps = [...testCase.steps];
    newSteps[idx] = updated;
    onUpdate({ ...testCase, steps: newSteps });
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newSteps = [...testCase.steps];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newSteps.length) return;
    [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
    // Recompute order
    newSteps.forEach((s, i) => (s.order = i + 1));
    onUpdate({ ...testCase, steps: newSteps });
  };

  const addStep = () => {
    const newStep: TestStep = {
      id: `st-${Date.now()}`,
      order: testCase.steps.length + 1,
      action: 'New step action',
      expected: 'Expected result',
    };
    onUpdate({ ...testCase, steps: [...testCase.steps, newStep] });
  };

  const removeStep = (idx: number) => {
    const newSteps = testCase.steps.filter((_, i) => i !== idx);
    newSteps.forEach((s, i) => (s.order = i + 1));
    onUpdate({ ...testCase, steps: newSteps });
  };

  const automationBorder = testCase.automationTest
    ? testCase.automationTest.status === 'pass'
      ? 'border-l-emerald-400'
      : testCase.automationTest.status === 'fail'
      ? 'border-l-red-400'
      : testCase.automationTest.status === 'running'
      ? 'border-l-amber-400'
      : 'border-l-zinc-300'
    : 'border-l-transparent';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-l-[3px] transition-all',
        automationBorder,
        isDragging
          ? 'border-zinc-300 shadow-lg bg-white'
          : 'border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm'
      )}
    >
      {/* Collapsed Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
        onClick={onToggle}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-zinc-50"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Code */}
        <span className="shrink-0 font-mono text-[11px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
          {testCase.code}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">
            {testCase.title}
          </p>
        </div>

        {/* Meta badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {testCase.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          <PriorityBadge priority={testCase.priority} />
          <StatusBadge status={testCase.status} />
          <AutomationBadge test={testCase.automationTest} />

          {/* View detail */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            onClick={e => {
              e.stopPropagation();
              setDetailOpen(true);
            }}
            title="View details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {/* Run / Re-run button */}
          <RunButton
            testCase={testCase}
            runState={runState}
            onStart={runner.start}
            onCancel={runner.cancel}
          />

          <div className="flex items-center gap-1 text-[11px] text-zinc-400 ml-1">
            <Layers className="w-3 h-3" />
            {testCase.steps.length}
          </div>
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 text-zinc-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-5 border-t border-zinc-50">
          {/* Active run simulator takes precedence */}
          {runState && runState.testCaseId === testCase.id && runState.phase !== 'cancelled' ? (
            <div className="mt-4">
              <TestRunPanel
                testCase={testCase}
                runState={runState}
                onCancel={runner.cancel}
              />
            </div>
          ) : testCase.automationTest ? (
            /* Last Run — shown when not actively running */
            <div className="mt-4">
              <LastRunPanel
                test={testCase.automationTest}
              />
            </div>
          ) : null}

          {/* Mobile meta badges */}
          <div className="flex sm:hidden flex-wrap gap-2 mt-4">
            <PriorityBadge priority={testCase.priority} onChange={p => onUpdate({ ...testCase, priority: p })} />
            <StatusBadge status={testCase.status} onChange={s => onUpdate({ ...testCase, status: s })} />
            <AutomationBadge test={testCase.automationTest} />
          </div>

          {/* Editable fields */}
          <div className="mt-4 space-y-4">
            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <InlineField
                value={testCase.description || ''}
                onChange={v => onUpdate({ ...testCase, description: v })}
                multiline
                placeholder="No description"
              />
            </div>

            {/* Precondition */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                Precondition
              </label>
              <InlineField
                value={testCase.preCondition || ''}
                onChange={v => onUpdate({ ...testCase, preCondition: v })}
                multiline
                placeholder="No preconditions"
              />
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Steps
                </label>
                <button
                  onClick={addStep}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add step
                </button>
              </div>
              <div className="space-y-0">
                {testCase.steps.map((step, idx) => (
                  <div key={step.id} className="relative group/step">
                    <StepItem
                      step={step}
                      isFirst={idx === 0}
                      isLast={idx === testCase.steps.length - 1}
                      onChange={s => handleStepChange(idx, s)}
                      onMoveUp={() => moveStep(idx, -1)}
                      onMoveDown={() => moveStep(idx, 1)}
                    />
                    {/* Delete step button */}
                    <button
                      onClick={() => removeStep(idx)}
                      className="absolute right-0 top-1 p-1 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/step:opacity-100 transition-opacity"
                      title="Remove step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                Note
              </label>
              <InlineField
                value={testCase.note || ''}
                onChange={v => onUpdate({ ...testCase, note: v })}
                multiline
                placeholder="No notes"
              />
            </div>

            {/* Desktop inline status/priority editors */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
              <PriorityBadge priority={testCase.priority} onChange={p => onUpdate({ ...testCase, priority: p })} />
              <StatusBadge status={testCase.status} onChange={s => onUpdate({ ...testCase, status: s })} />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <TestCaseDetailModal
        testCase={testCase}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Section Sidebar Item
// ─────────────────────────────────────────────
const SectionSidebarItem: React.FC<{
  section: TestSection;
  isActive: boolean;
  onSelect: () => void;
  automationPercent: number;
}> = ({ section, isActive, onSelect, automationPercent }) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2.5 transition-all group',
        isActive
          ? 'bg-white border border-zinc-200 shadow-sm'
          : 'hover:bg-zinc-100/50 border border-transparent'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'
          )}
        >
          {section.title}
        </span>
        <span
          className={cn(
            'shrink-0 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md',
            isActive ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-100/50 text-zinc-500'
          )}
        >
          {section.testCases.length}
        </span>
      </div>
      {/* Automation coverage bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${automationPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-400 font-medium tabular-nums">
          {automationPercent}%
        </span>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────
// Section Selection Modal (for generation)
// ─────────────────────────────────────────────
const SectionSelectModal: React.FC<{
  open: boolean;
  sections: TestSection[];
  onClose: () => void;
  onGenerate: (ids: string[]) => void;
}> = ({ open, sections, onClose, onGenerate }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection when modal opens
  React.useEffect(() => {
    if (open) setSelected(new Set());
  }, [open]);

  // Escape to close
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">Generate Automation Tests</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Select sections to generate AI-powered automation tests from.
          </p>
        </div>
        <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
          {sections.map(section => {
            const isSelected = selected.has(section.id);
            return (
              <div
                key={section.id}
                onClick={() => toggle(section.id)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'border-zinc-900 bg-white shadow-sm ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                )}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{section.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {section.testCases.length} test cases ·{' '}
                    {section.testCases.filter(tc => tc.automationTest).length} already automated
                  </p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                    isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white'
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-3">
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white"
            disabled={selected.size === 0}
            onClick={() => {
              onGenerate(Array.from(selected));
              setSelected(new Set());
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Generate for {selected.size} section{selected.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
interface ScenarioDetailProps {
  scenario: TestScenario;
  projectName?: string;
  onClose: () => void;
  onGenerate: (sectionIds: string[]) => void;
  onDelete: () => void;
  onUpdateScenario?: (id: string, data: any) => Promise<void>;
  onUpdateTestCase?: (sectionId: string, tcId: string, data: any) => Promise<void>;
  onReorderTestCases?: (sectionId: string, orderedIds: string[]) => Promise<void>;
  onAddTestCase?: (sectionId: string, data: any) => Promise<void>;
  onDeleteTestCase?: (sectionId: string, tcId: string) => Promise<void>;
}

export const ScenarioDetail: React.FC<ScenarioDetailProps> = ({
  scenario: initialScenario,
  projectName,
  onClose,
  onGenerate,
  onDelete,
  onUpdateScenario,
  onUpdateTestCase,
  onReorderTestCases,
  onAddTestCase,
  onDeleteTestCase,
}) => {
  const [scenario, setScenario] = useState<TestScenario>(initialScenario);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initialScenario.sections![0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showGenModal, setShowGenModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TestCaseStatus | 'all'>('all');
  const [runState, setRunState] = useState<TestRunState | null>(null);
  const ITEMS_PER_PAGE = 10;

  const activeSection = scenario.sections!.find(s => s.id === activeSectionId);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filtered test cases
  const filteredTestCases = useMemo(() => {
    if (!activeSection) return [];
    let cases = [...activeSection.testCases];
    if (statusFilter !== 'all') {
      cases = cases.filter(tc => tc.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(
        tc =>
          tc.title.toLowerCase().includes(q) ||
          tc.code.toLowerCase().includes(q) ||
          tc.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return cases;
  }, [activeSection, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTestCases.length / ITEMS_PER_PAGE));
  const paginatedCases = filteredTestCases.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [activeSectionId, searchQuery, statusFilter]);

  // Drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !activeSection) return;

      const oldIndex = activeSection.testCases.findIndex(tc => tc.id === active.id);
      const newIndex = activeSection.testCases.findIndex(tc => tc.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newCases = arrayMove(activeSection.testCases, oldIndex, newIndex);
      newCases.forEach((tc, i) => (tc.order = i + 1));

      setScenario(prev => ({
        ...prev,
        sections: prev.sections!.map(s =>
          s.id === activeSection.id ? { ...s, testCases: newCases } : s
        ),
      }));

      if (onReorderTestCases) {
        onReorderTestCases(activeSection.id, newCases.map(tc => tc.id)).catch(console.error);
      }
    },
    [activeSection, onReorderTestCases]
  );

  // Update a test case
  const updateTestCase = useCallback(
    (sectionId: string, updated: TestCase) => {
      setScenario(prev => ({
        ...prev,
        sections: prev.sections!.map(s =>
          s.id === sectionId
            ? {
                ...s,
                testCases: s.testCases.map(tc => (tc.id === updated.id ? updated : tc)),
              }
            : s
        ),
      }));

      if (onUpdateTestCase) {
        onUpdateTestCase(sectionId, updated.id, updated).catch(console.error);
      }
    },
    [onUpdateTestCase]
  );

  // Toggle expanded
  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Stats for header
  const stats = scenario.stats ?? {
    totalSections: scenario.sections!.length,
    totalTestCases: scenario.sections!.reduce((a, s) => a + s.testCases.length, 0),
    totalSteps: scenario.sections!.reduce((a, s) => a + s.testCases.reduce((b, tc) => b + tc.steps.length, 0), 0),
    automatedCount: 0,
    passCount: 0,
    failCount: 0,
    draftCount: 0,
  };

  // Scenario status color
  const scenarioStatusColor =
    scenario.status === 'ready'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : scenario.status === 'generating'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : scenario.status === 'failed'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-zinc-50 text-zinc-700 border-zinc-200';

  return (
    <div className="flex flex-col h-full bg-zinc-50/40">
      {/* Top Header */}
      <div className="shrink-0 bg-white border-b border-zinc-100">
        <div className="px-6 pt-6 pb-4 max-w-[1600px] mx-auto">
          {/* Breadcrumb */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Test Scenarios
          </button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  <InlineField
                    value={scenario.title}
                    onChange={v => {
                      setScenario(prev => ({ ...prev, title: v }));
                      if (onUpdateScenario) onUpdateScenario(scenario.id, { title: v }).catch(console.error);
                    }}
                    inputClassName="text-2xl font-semibold tracking-tight"
                  />
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize font-medium px-2.5 py-0.5 rounded-full text-xs',
                    scenarioStatusColor
                  )}
                >
                  {scenario.status}
                </Badge>
              </div>

              {/* Description */}
              <div className="mt-1.5 text-sm text-zinc-500 max-w-2xl">
                <InlineField
                  value={scenario.description || ''}
                  onChange={v => {
                    setScenario(prev => ({ ...prev, description: v }));
                    if (onUpdateScenario) onUpdateScenario(scenario.id, { description: v }).catch(console.error);
                  }}
                  multiline
                  placeholder="Add a description..."
                />
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium">
                    {scenario.projectName || projectName || 'Unassigned Project'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium">
                    {new Date(scenario.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {scenario.creatorId?.toString() && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">by {scenario.creatorId?.toString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg gap-2 text-sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Button
                className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg gap-2 text-sm shadow-sm"
                onClick={() => setShowGenModal(true)}
              >
                <Play className="w-4 h-4" />
                Generate Tests
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-zinc-50">
            <StatPill icon={<Layers className="w-3.5 h-3.5" />} label="Sections" value={stats.totalSections} />
            <StatPill icon={<FileSpreadsheet className="w-3.5 h-3.5" />} label="Test Cases" value={stats.totalTestCases} />
            <StatPill icon={<Hash className="w-3.5 h-3.5" />} label="Steps" value={stats.totalSteps} />
            <StatPill
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              label="Automated"
              value={stats.automatedCount}
              accent
            />
            {stats.failCount > 0 && (
              <StatPill
                icon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                label="Failing"
                value={stats.failCount}
                danger
              />
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {scenario.error && (
        <div className="shrink-0 mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 max-w-[1600px]">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800 text-sm">Generation Failed</p>
            <p className="text-sm text-red-600 mt-0.5">{scenario.error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <div className="w-64 shrink-0 border-r border-zinc-100 bg-zinc-50/30 hidden lg:flex flex-col">
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              <h3 className="px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Sections
              </h3>
              {scenario.sections!.map(section => {
                const autoCount = section.testCases.filter(tc => tc.automationTest).length;
                const pct = Math.round((autoCount / Math.max(1, section.testCases.length)) * 100);
                return (
                  <SectionSidebarItem
                    key={section.id}
                    section={section}
                    isActive={section.id === activeSectionId}
                    onSelect={() => {
                      setActiveSectionId(section.id);
                      setExpandedIds(new Set());
                    }}
                    automationPercent={pct}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Section Selector */}
        <div className="lg:hidden px-4 pt-4 pb-0 shrink-0 w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {scenario.sections!.map(section => {
              const isActive = section.id === activeSectionId;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setExpandedIds(new Set());
                  }}
                  className={cn(
                    'shrink-0 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    isActive
                      ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm'
                      : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                  )}
                >
                  {section.title}
                  <span className="ml-1.5 text-xs text-zinc-400">{section.testCases.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Cases Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 px-4 lg:px-6 py-4 lg:py-6">
            {activeSection ? (
              <div className="space-y-4 w-full">
                {/* Section header + controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">{activeSection.title}</h2>
                    {activeSection.description && (
                      <p className="text-sm text-zinc-500 mt-0.5">{activeSection.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <Input
                        placeholder="Search test cases..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 w-52 text-sm rounded-lg bg-white border-zinc-200"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as TestCaseStatus | 'all')}
                        className="h-8 pl-2.5 pr-7 text-sm rounded-lg bg-white border border-zinc-200 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-300 appearance-none cursor-pointer"
                      >
                        <option value="all">All statuses</option>
                        <option value="ready">Ready</option>
                        <option value="draft">Draft</option>
                        <option value="blocked">Blocked</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                      <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    Showing{' '}
                    <span className="font-medium text-zinc-900">
                      {Math.min(filteredTestCases.length, (page - 1) * ITEMS_PER_PAGE + 1)}
                    </span>{' '}
                    –{' '}
                    <span className="font-medium text-zinc-900">
                      {Math.min(page * ITEMS_PER_PAGE, filteredTestCases.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-zinc-900">{filteredTestCases.length}</span>
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>

                {/* Test Cases List */}
                {paginatedCases.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={paginatedCases.map(tc => tc.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {paginatedCases.map(tc => (
                          <SortableTestCase
                            key={tc.id}
                            scenarioId={scenario.id}
                            sectionId={activeSection.id}
                            testCase={tc}
                            isExpanded={expandedIds.has(tc.id) || runState?.testCaseId === tc.id}
                            onToggle={() => toggleExpanded(tc.id)}
                            onUpdate={updated => updateTestCase(activeSection.id, updated)}
                            runState={runState}
                            onRunStateChange={setRunState}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-center py-16 rounded-2xl bg-white border border-zinc-100">
                    <FileSpreadsheet className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No test cases match your filters.'
                        : 'No test cases in this section.'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 pb-4">
                    <span className="text-xs text-zinc-500">
                      Page <span className="font-medium text-zinc-900">{page}</span> of{' '}
                      <span className="font-medium text-zinc-900">{totalPages}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-zinc-400">
                Select a section to view test cases
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Generation Modal */}
      <SectionSelectModal
        open={showGenModal}
        sections={scenario.sections!}
        onClose={() => setShowGenModal(false)}
        onGenerate={ids => {
          onGenerate(ids);
          setShowGenModal(false);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{scenario.title}</strong>? This action cannot be undone. All test cases and their automation data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─────────────────────────────────────────────
// Stat Pill
// ─────────────────────────────────────────────
function StatPill({
  icon,
  label,
  value,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <p
        className={cn(
          'text-lg font-semibold leading-none',
          danger ? 'text-red-600' : accent ? 'text-emerald-600' : 'text-zinc-900'
        )}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-1.5 text-zinc-500">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
