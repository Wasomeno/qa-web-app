import React, { useState, useMemo, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GripVertical,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Search,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Layers,
  Tag,
  ArrowUp,
  ArrowDown,

  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  Pencil,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  History,
  MoreHorizontal,
  Server,
  Monitor,
  ClipboardCheck,
  Copy,
  Upload,
} from "lucide-react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getGitLabProjects } from "@/api/project";
import {
  TestScenario,
  TestSection,
  TestCase,
  TestStep,
  Priority,
  ProcessingStatus,
  TestCaseAutomationStatus,
  AutomationStatus,
  AutomationCategory,
  ManualTestStatus,
} from "@/types/test-scenario";
import { testScenarioApi } from "@/api/test-scenario";

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
export const ScenarioDetailSkeleton: React.FC<{ nested?: boolean }> = ({
  nested = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* TopAppBar Skeleton */}
      <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex-1 flex justify-center px-4">
          <Skeleton className="h-5 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <div className="flex items-center gap-1 border-l border-zinc-200 pl-2 ml-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Split View Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-[300px] shrink-0 border-r border-zinc-200 bg-[#F9FAFB] flex flex-col">
          <div className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-8 rounded" />
          </div>
          <div className="p-3 border-b border-zinc-200 bg-white">
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <div className="px-3 py-2 border-b border-zinc-200 bg-white">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="px-3 py-2 border-b border-zinc-200 bg-white">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="px-3 py-2 border-b border-zinc-200 bg-white">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="px-4 py-2.5 border-b border-zinc-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full rounded mb-1" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-zinc-200 bg-white flex items-center justify-between">
            <Skeleton className="h-3 w-8 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        </aside>

        {/* Content Skeleton */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto p-6 pb-6">
            {/* Header Data */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-7 w-3/4 rounded-md mb-3" />
              <Skeleton className="h-4 w-full rounded" />
            </div>

            {/* Automation Category Panel */}
            <div className="mb-6">
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>

            {/* Environment Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border border-zinc-200 rounded-lg">
                  <Skeleton className="h-3 w-20 rounded mb-2" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))}
            </div>

            {/* Steps Table */}
            <div className="mb-6">
              <Skeleton className="h-5 w-32 rounded mb-3" />
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 bg-[#F9FAFB] border-b border-zinc-200">
                  <Skeleton className="h-3 w-4 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 border-b border-zinc-100"
                  >
                    <Skeleton className="h-3 w-4 rounded mx-auto" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            <div>
              <Skeleton className="h-5 w-40 rounded mb-3" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

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
  placeholder = "Click to edit…",
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
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  if (!editing) {
    const isEmpty = !value || value.trim().length === 0;
    return (
      <div
        onClick={startEdit}
        className={cn(
          "cursor-text group relative rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-zinc-50",
          isEmpty && "italic text-zinc-400",
          className,
        )}
      >
        <span className={isEmpty ? "" : ""}>
          {isEmpty ? placeholder : value}
        </span>
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
      "w-full bg-white border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 rounded-md text-inherit",
      multiline
        ? "min-h-[60px] resize-y py-1.5 px-2 text-sm leading-relaxed"
        : "h-7 py-0.5 px-2 text-sm",
      inputClassName,
    ),
  };

  return multiline ? <Textarea {...sharedProps} /> : <Input {...sharedProps} />;
};

// ─────────────────────────────────────────────
// Priority Badge + Selector
// ─────────────────────────────────────────────
const PRIORITY_META: Record<Priority, { label: string; classes: string }> = {
  low: { label: "Low", classes: "bg-zinc-50 text-zinc-700 border-zinc-100" },
  medium: {
    label: "Medium",
    classes: "bg-amber-50 text-amber-700 border-amber-100",
  },
  high: {
    label: "High",
    classes: "bg-orange-50 text-orange-700 border-orange-100",
  },
  critical: {
    label: "Critical",
    classes: "bg-red-50 text-red-700 border-red-100",
  },
};

const PriorityBadge: React.FC<{
  priority: Priority;
  onChange?: (p: Priority) => void;
}> = ({ priority, onChange }) => {
  const meta = PRIORITY_META[priority] ?? { label: priority, classes: 'bg-zinc-50 text-zinc-700 border-zinc-100' };
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onChange && setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border transition-opacity",
          meta.classes,
          onChange ? "cursor-pointer hover:opacity-80" : "cursor-default",
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
                "w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 transition-colors flex items-center justify-between",
                p === priority && "bg-zinc-50",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  PRIORITY_META[p].classes
                    .split(" ")[1]
                    .replace("text-", "bg-"),
                )}
              />
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
// Test Case Status Display (processing + automation)
// ─────────────────────────────────────────────
function getTestCaseDisplayStatus(testCase: TestCase): string {
  if (testCase.processingStatus === 'generating') return 'Generating';
  if (testCase.processingStatus === 'generation_failed') return 'Generation failed';
  switch (testCase.automationStatus) {
    case 'running': return 'Running';
    case 'failed': return 'Failed';
    case 'passed': return 'Passed';
    case 'idle': return 'Generated';
    default: return 'Not generated';
  }
}

const TEST_CASE_STATUS_CLASSES: Record<string, string> = {
  Generating: 'bg-amber-50 text-amber-700 border-amber-100',
  'Generation failed': 'bg-red-50 text-red-700 border-red-100',
  Running: 'bg-blue-50 text-blue-700 border-blue-100',
  Failed: 'bg-red-50 text-red-700 border-red-100',
  Passed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Generated: 'bg-zinc-50 text-zinc-500 border-zinc-200',
  'Not generated': 'bg-zinc-50 text-zinc-400 border-zinc-200',
};

const TestCaseStatusBadge: React.FC<{ testCase: TestCase }> = ({ testCase }) => {
  const label = getTestCaseDisplayStatus(testCase);
  const classes = TEST_CASE_STATUS_CLASSES[label] ?? 'bg-zinc-50 text-zinc-400 border-zinc-200';
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border", classes)}>
      {testCase.processingStatus === 'generating' && <Loader2 className="w-3 h-3 animate-spin" />}
      {testCase.automationStatus === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
      {testCase.automationStatus === 'passed' && <CheckCircle2 className="w-3 h-3" />}
      {testCase.automationStatus === 'failed' && <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────
// Automation Badge
// ─────────────────────────────────────────────
const AutomationBadge: React.FC<{
  test?: {
    status: AutomationStatus;
    name: string;
    lastRunAt?: string;
    category?: AutomationCategory;
  };
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

  const meta: Record<
    AutomationStatus,
    { icon: React.ReactNode; classes: string }
  > = {
    idle: {
      icon: <Clock className="w-3 h-3" />,
      classes: "bg-zinc-50 text-zinc-500 border-zinc-200",
    },
    running: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      classes: "bg-amber-50 text-amber-700 border-amber-100",
    },
    pass: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    fail: {
      icon: <XCircle className="w-3 h-3" />,
      classes: "bg-red-50 text-red-700 border-red-100",
    },
  };

  const m = meta[test.status] ?? { icon: <Clock className="w-3 h-3" />, classes: 'bg-zinc-50 text-zinc-500 border-zinc-200' };
  const timeAgo = test.lastRunAt
    ? `${Math.max(1, Math.round((Date.now() - new Date(test.lastRunAt).getTime()) / 60000))}m`
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-opacity hover:opacity-80",
        m.classes,
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      {m.icon}
      {test.category ? `${CATEGORY_META[test.category].label}: ` : ""}
      {test.status === "pass"
        ? "Pass"
        : test.status === "fail"
          ? "Fail"
          : test.status === "running"
            ? "Running"
            : "Idle"}
      {timeAgo && <span className="opacity-60">· {timeAgo}</span>}
    </button>
  );
};

const CATEGORY_META: Record<
  AutomationCategory,
  {
    label: string;
    icon: React.ReactNode;
    description: string;
    classes: string;
  }
> = {
  api: {
    label: "API Test",
    icon: <Server className="w-3.5 h-3.5" />,
    description: "Prompt for backend developers to create API coverage.",
    classes: "bg-sky-50 text-sky-700 border-sky-100",
  },
  e2e: {
    label: "End to End",
    icon: <Monitor className="w-3.5 h-3.5" />,
    description:
      "Generate Playwright-style browser automation from frontend code.",
    classes: "bg-violet-50 text-violet-700 border-violet-100",
  },
  manual: {
    label: "Manual",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    description: "Record pass or fail evidence without automation generation.",
    classes: "bg-zinc-50 text-zinc-700 border-zinc-200",
  },
};

function inferAutomationCategory(testCase: TestCase): AutomationCategory {
  const cat = testCase.automationType || testCase.automationTest?.category;
  if (cat === 'api' || cat === 'e2e' || cat === 'manual') return cat;
  return 'manual';
}

type AutomationCategoryUpdateResult = Awaited<
  ReturnType<typeof testScenarioApi.updateTestCaseAutomationCategory>
> | void;

function isTestScenarioResult(value: unknown): value is TestScenario {
  return Boolean(value && typeof value === "object" && "sections" in value);
}

function isTestCaseResult(value: unknown): value is TestCase {
  return Boolean(
    value && typeof value === "object" && "code" in value && "steps" in value,
  );
}

function extractScenarioResult(
  result: AutomationCategoryUpdateResult,
): TestScenario | null {
  if (isTestScenarioResult(result)) return result;
  const maybe = result as { scenario?: unknown } | undefined;
  return isTestScenarioResult(maybe?.scenario) ? maybe.scenario : null;
}

function extractTestCaseResult(
  result: AutomationCategoryUpdateResult,
): TestCase | null {
  if (isTestCaseResult(result)) return result;
  const maybe = result as { testCase?: unknown } | undefined;
  return isTestCaseResult(maybe?.testCase) ? maybe.testCase : null;
}

function withAutomationCategory(
  testCase: TestCase,
  category: AutomationCategory | null,
): TestCase {
  return {
    ...testCase,
    automationType: category ?? undefined,
    automationTest: testCase.automationTest
      ? { ...testCase.automationTest, category: category ?? undefined }
      : testCase.automationTest,
    updatedAt: new Date().toISOString(),
  };
}

function hasPendingAutomationGeneration(scenario: TestScenario): boolean {
  return Boolean(
    scenario.processingStatus === "generating" ||
    scenario.sections?.some((section) =>
      section.testCases.some(
        (testCase) => testCase.processingStatus === "generating" || testCase.automationTest?.status === "running",
      ),
    ),
  );
}

function getAutomationGenerationPollKey(scenario: TestScenario): string {
  const statuses =
    scenario.sections
      ?.flatMap((section) =>
        section.testCases.map(
          (testCase) =>
            `${testCase.id}:${testCase.processingStatus || "idle"}:${testCase.automationTest?.status || "none"}`,
        ),
      )
      .join("|") || "";
  return `${scenario.processingStatus || "idle"}:${statuses}`;
}

const AutomationCategorySelect: React.FC<{
  value: AutomationCategory;
  onChange: (category: AutomationCategory) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const meta = CATEGORY_META[value] ?? { label: value, icon: null, description: '', classes: 'bg-zinc-50 text-zinc-700 border-zinc-200' };
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as AutomationCategory)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Automation category"
          className={cn(
            "h-7 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold outline-none transition-colors cursor-pointer",
            disabled && "cursor-wait opacity-70",
            meta.classes,
          )}
        >
          <div className="flex items-center gap-1.5">
            {meta.icon}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="api">API Test</SelectItem>
          <SelectItem value="e2e">End to End</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// ─────────────────────────────────────────────
// Last Run Panel (rich automation test details)
// ─────────────────────────────────────────────
const GeneratedAutomationSteps: React.FC<{
  steps?: NonNullable<TestCase["automationTest"]>["steps"];
}> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-zinc-100">
      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Generated Steps
      </p>
      <div className="space-y-1.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs bg-white rounded-md px-2.5 py-2 border border-zinc-100"
          >
            <span className="shrink-0 font-mono text-[10px] text-zinc-400 w-4 mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              {step.action === "api_request" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {step.apiMethod && (
                      <span
                        className="font-mono text-[10px] px-1 py-0.5 rounded font-bold tracking-wide"
                        style={{
                          backgroundColor:
                            step.apiMethod === "GET"
                              ? "#dbeafe"
                              : step.apiMethod === "POST"
                                ? "#dcfce7"
                                : step.apiMethod === "PUT"
                                  ? "#fef9c3"
                                  : step.apiMethod === "DELETE"
                                    ? "#fee2e2"
                                    : "#f3f4f6",
                          color:
                            step.apiMethod === "GET"
                              ? "#1e40af"
                              : step.apiMethod === "POST"
                                ? "#166534"
                                : step.apiMethod === "PUT"
                                  ? "#854d0e"
                                  : step.apiMethod === "DELETE"
                                    ? "#991b1b"
                                    : "#374151",
                        }}
                      >
                        {step.apiMethod}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-zinc-700 break-all">
                      {step.apiEndpoint || step.value}
                    </span>
                    {step.assertionType && (
                      <span className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-500">
                        {step.assertionType}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-zinc-500">{step.description}</p>
                  )}
                  {step.apiPayload && step.apiPayload !== "{}" && (
                    <div className="mt-1">
                      <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Payload
                      </span>
                      <code className="block text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-100 p-1.5 rounded mt-0.5 whitespace-pre-wrap break-words">
                        {step.apiPayload}
                      </code>
                    </div>
                  )}
                  {step.apiHeaders && step.apiHeaders !== "{}" && (
                    <div className="mt-1">
                      <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Headers
                      </span>
                      <code className="block text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-100 p-1.5 rounded mt-0.5 whitespace-pre-wrap break-words">
                        {step.apiHeaders}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="font-medium text-zinc-700">
                    {step.action}
                  </span>
                  {step.description && (
                    <span className="text-zinc-500 ml-1">
                      — {step.description}
                    </span>
                  )}
                  {step.selector && (
                    <code className="block text-[10px] text-zinc-400 mt-0.5 truncate">
                      {step.selector}
                    </code>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LastRunPanel: React.FC<{
  test: {
    status: AutomationStatus;
    name: string;
    steps?: NonNullable<TestCase["automationTest"]>["steps"];
    lastRunAt?: string;
    runDurationMs?: number;
    videoUrl?: string;
    stepResults?: { stepIndex: number; status: string; error?: string }[];
    log?: string;
    errorMessage?: string;
    failedStepIndex?: number;
  };
}> = ({ test }) => {
  const isPass = test.status === "pass";
  const isFail = test.status === "fail";

  const timeAgo = test.lastRunAt
    ? (() => {
        const mins = Math.round(
          (Date.now() - new Date(test.lastRunAt).getTime()) / 60000,
        );
        if (mins < 1) return "just now";
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
        "rounded-xl border overflow-hidden",
        isPass
          ? "bg-emerald-50/40 border-emerald-100"
          : isFail
            ? "bg-red-50/40 border-red-100"
            : "bg-zinc-50 border-zinc-100",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isPass && "border-b border-emerald-100/60",
          isFail && "border-b border-red-100/60",
          !isPass && !isFail && "border-b border-zinc-100",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              isPass && "bg-emerald-100 text-emerald-700",
              isFail && "bg-red-100 text-red-700",
              !isPass && !isFail && "bg-zinc-100 text-zinc-500",
            )}
          >
            {isPass ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isFail ? (
              <XCircle className="w-4 h-4" />
            ) : test.status === "running" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                isPass && "text-emerald-800",
                isFail && "text-red-800",
                !isPass && !isFail && "text-zinc-700",
              )}
            >
              {isPass
                ? "Passed"
                : isFail
                  ? "Failed"
                  : test.status === "running"
                    ? "Running"
                    : "Not Run"}
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

      <GeneratedAutomationSteps steps={test.steps} />

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
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
                  sr.status === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                <span className="font-mono text-[10px] w-5">
                  {sr.stepIndex + 1}
                </span>
                <span className="flex-1">
                  {sr.status === "success" ? "Passed" : "Failed"}
                </span>
                {sr.error && (
                  <span className="text-[10px] opacity-80 truncate max-w-[200px]">
                    {sr.error}
                  </span>
                )}
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
          <p className="text-sm text-red-800 leading-relaxed">
            {test.errorMessage}
          </p>
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

const RepoPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [search, setSearch] = useState("");
  const { data, isFetching } = useQuery({
    queryKey: ["gitlab-projects", "automation-repo", search],
    queryFn: () => getGitLabProjects(search),
    enabled: search.trim().length >= 2,
    staleTime: 30_000,
  });
  const projects = data?.data?.projects || [];

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="h-9 rounded-lg border-zinc-200 text-sm"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Repo ID"
          className="h-9 rounded-lg border-zinc-200 font-mono text-sm"
        />
      </div>
      {search.trim().length >= 2 && (
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-1.5">
          {isFetching ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching repositories
            </div>
          ) : projects.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {projects.slice(0, 6).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onChange(String(project.id));
                    setSearch(
                      project.path_with_namespace ||
                        project.name ||
                        String(project.id),
                    );
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs hover:bg-white"
                >
                  <span className="min-w-0 truncate font-medium text-zinc-700">
                    {project.path_with_namespace || project.name}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {project.id}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2 py-1.5 text-xs text-zinc-500">
              No repositories found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const AutomationCategoryPanel: React.FC<{
  scenarioId: string;
  projectId?: string;
  sectionId: string;
  testCase: TestCase;
  category: AutomationCategory;
  onUpdate: (tc: TestCase) => void;
}> = ({ scenarioId, projectId, sectionId, testCase, category, onUpdate }) => {
  const [backendRepoId, setBackendRepoId] = useState(
    testCase.automationTest?.repoId || "",
  );
  const [frontendRepoId, setFrontendRepoId] = useState(
    testCase.automationTest?.repoId || "",
  );

  React.useEffect(() => {
    const repoId = testCase.automationTest?.repoId || "";
    if (testCase.automationTest?.category === "api") setBackendRepoId(repoId);
    if (testCase.automationTest?.category === "e2e") setFrontendRepoId(repoId);
  }, [testCase.automationTest?.repoId, testCase.automationTest?.category]);

  if (!projectId) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        Project context is required before automation can be configured.
      </div>
    );
  }

  if (category === "api") {
    return (
      <APIAutomationPanel
        scenarioId={scenarioId}
        projectId={projectId}
        testCase={testCase}
        backendRepoId={backendRepoId}
        setBackendRepoId={setBackendRepoId}
        onUpdate={onUpdate}
      />
    );
  }

  if (category === "e2e") {
    return (
      <E2EAutomationPanel
        scenarioId={scenarioId}
        projectId={projectId}
        sectionId={sectionId}
        testCase={testCase}
        frontendRepoId={frontendRepoId}
        setFrontendRepoId={setFrontendRepoId}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <ManualAutomationPanel
      scenarioId={scenarioId}
      projectId={projectId}
      testCase={testCase}
    />
  );
};

const APIAutomationPanel: React.FC<{
  scenarioId: string;
  projectId: string;
  testCase: TestCase;
  backendRepoId: string;
  setBackendRepoId: (value: string) => void;
  onUpdate: (tc: TestCase) => void;
}> = ({
  scenarioId,
  projectId,
  testCase,
  backendRepoId,
  setBackendRepoId,
  onUpdate,
}) => {
  const prompt =
    testCase.automationTest?.category === "api"
      ? testCase.automationTest.prompt
      : "";
  const mutation = useMutation({
    mutationFn: () =>
      testScenarioApi.generateAutomation(scenarioId, projectId, {
        category: "api",
        testCaseIds: [testCase.id],
        backendRepoId,
      }),
    onSuccess: (result) => {
      const nextPrompt =
        result.prompts?.find((p) => p.testCaseId === testCase.id)?.prompt ||
        prompt ||
        "";
      onUpdate({
        ...testCase,
        automationType: "api",
        automationTest: {
          id: testCase.automationTest?.id || `api-prompt-${testCase.id}`,
          name: `${testCase.code} API test prompt`,
          category: "api",
          repoId: backendRepoId,
          prompt: nextPrompt,
          status: "idle",
          lastRunAt: new Date().toISOString(),
        },
      });
      toast.success("API prompt generated");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate API prompt",
      ),
  });

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sky-950">Backend prompt</p>
          <p className="mt-0.5 text-xs text-sky-700/80">
            Select the backend repo. The result is a compact prompt for a
            developer's local coding agent.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 rounded-lg bg-sky-700 text-white hover:bg-sky-800"
          disabled={!backendRepoId || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          )}
          Generate prompt
        </Button>
      </div>

      <RepoPicker
        label="Backend repository"
        value={backendRepoId}
        onChange={setBackendRepoId}
        placeholder="Search backend repo or paste ID"
      />

      {prompt && (
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Generated prompt
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-md px-2 text-xs"
              onClick={() => {
                navigator.clipboard?.writeText(prompt);
                toast.success("Prompt copied");
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-100">
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
};

const E2EAutomationPanel: React.FC<{
  scenarioId: string;
  projectId: string;
  sectionId: string;
  testCase: TestCase;
  frontendRepoId: string;
  setFrontendRepoId: (value: string) => void;
  onUpdate: (tc: TestCase) => void;
}> = ({
  scenarioId,
  projectId,
  testCase,
  frontendRepoId,
  setFrontendRepoId,
  onUpdate,
}) => {
  const mutation = useMutation({
    mutationFn: () =>
      testScenarioApi.generateAutomation(scenarioId, projectId, {
        category: "e2e",
        testCaseIds: [testCase.id],
        frontendRepoId,
      }),
    onSuccess: () => {
      onUpdate({
        ...testCase,
        automationType: "e2e",
        automationTest: {
          id: testCase.automationTest?.id || `auto-pending-${testCase.id}`,
          name: `${testCase.code}_E2E`,
          category: "e2e",
          repoId: frontendRepoId,
          status: "running",
        },
      });
      toast.success("E2E generation started");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start E2E generation",
      ),
  });

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet-950">
            Browser automation
          </p>
          <p className="mt-0.5 text-xs text-violet-700/80">
            Select the frontend repo. Generation runs in the background and
            saves executable steps.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 rounded-lg bg-violet-700 text-white hover:bg-violet-800"
          disabled={
            !frontendRepoId ||
            mutation.isPending ||
            testCase.automationTest?.status === "running"
          }
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ||
          testCase.automationTest?.status === "running" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="mr-1.5 h-3.5 w-3.5" />
          )}
          {testCase.automationTest?.status === "running"
            ? "Generating"
            : "Generate E2E"}
        </Button>
      </div>

      <RepoPicker
        label="Frontend repository"
        value={frontendRepoId}
        onChange={setFrontendRepoId}
        placeholder="Search frontend repo or paste ID"
      />
    </div>
  );
};

const ManualAutomationPanel: React.FC<{
  scenarioId: string;
  projectId: string;
  testCase: TestCase;
}> = ({ scenarioId, projectId, testCase }) => {
  const [status, setStatus] = useState<ManualTestStatus>("passed");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { data: results = [], refetch } = useQuery({
    queryKey: ["manual-results", projectId, scenarioId, testCase.id],
    queryFn: () =>
      testScenarioApi.listManualResults(scenarioId, projectId, testCase.id),
  });

  const submit = useMutation({
    mutationFn: () =>
      testScenarioApi.createManualResult(scenarioId, projectId, testCase.id, {
        status,
        description,
        evidence: files,
      }),
    onSuccess: () => {
      setDescription("");
      setFiles([]);
      refetch();
      toast.success("Manual result saved");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to save manual result",
      ),
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-zinc-900">Manual execution</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Upload evidence, mark the outcome, and keep a concise note for audit
          history.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[160px_1fr]">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Result
          </label>
          <Select value={status} onValueChange={(v) => setStatus(v as ManualTestStatus)}>
            <SelectTrigger className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-300">
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Evidence files
          </label>
          <label className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-dashed border-zinc-300 bg-white px-3 text-sm text-zinc-500 hover:border-zinc-400">
            <span className="truncate">
              {files.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : "Choose evidence files"}
            </span>
            <Upload className="h-3.5 w-3.5" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was verified? Mention blockers or evidence context."
          className="min-h-20 rounded-lg border-zinc-200 bg-white text-sm"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          Evidence is stored in Cloudflare R2.
        </p>
        <Button
          size="sm"
          className="h-8 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800"
          disabled={
            !description.trim() || files.length === 0 || submit.isPending
          }
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          )}
          Save result
        </Button>
      </div>

      {results.length > 0 && (
        <div className="border-t border-zinc-200 pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Recent manual results
          </p>
          <div className="space-y-2">
            {results.slice(0, 3).map((result) => (
              <div
                key={result.id}
                className="rounded-lg border border-zinc-100 bg-white px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      result.status === "passed"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-red-100 bg-red-50 text-red-700",
                    )}
                  >
                    {result.status}
                  </Badge>
                  <span className="text-xs text-zinc-400">
                    {new Date(result.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-zinc-700">
                  {result.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.evidence.map((file) => (
                    <a
                      key={file.url}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            {testCase.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            <PriorityBadge priority={testCase.priority} />
            <TestCaseStatusBadge testCase={testCase} />
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
                    {step.data && (
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Data: {step.data}
                      </p>
                    )}
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Expected: {step.expected}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation */}
          {at && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Automation Test
                </h4>
                {at.framework && (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 uppercase font-mono bg-zinc-50/50"
                  >
                    {at.framework}
                  </Badge>
                )}
              </div>
              <LastRunPanel test={at} />
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
              onChange={(v) => onChange({ ...step, action: v })}
              inputClassName="font-medium"
            />
          </div>
          {step.data && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500">
              <span className="font-medium text-zinc-400 shrink-0">Input:</span>
              <InlineField
                value={step.data}
                onChange={(v) => onChange({ ...step, data: v })}
                inputClassName="text-xs"
              />
            </div>
          )}
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400 shrink-0">
              Expected:
            </span>
            <InlineField
              value={step.expected}
              onChange={(v) => onChange({ ...step, expected: v })}
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
type RunPhase = "idle" | "running" | "paused" | "completed" | "cancelled";

interface TestRunState {
  testCaseId: string;
  phase: RunPhase;
  currentStepIndex: number;
  completedStepIds: Set<string>;
  result: "pass" | "fail" | null;
  errorMessage?: string;
}

function useTestRunner(
  scenarioId: string,
  sectionId: string,
  testCase: TestCase,
  state: TestRunState | null,
  onUpdateState: React.Dispatch<React.SetStateAction<TestRunState | null>>,
  onTestCaseUpdate: (tc: TestCase) => void,
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
      testCase.automationTest?.status === "running" &&
      (!state || state.testCaseId !== testCase.id)
    ) {
      onUpdateState({
        testCaseId: testCase.id,
        phase: "running",
        currentStepIndex: 0,
        completedStepIds: new Set(),
        result: null,
      });

      intervalRef.current = setInterval(async () => {
        try {
          const scenario = await testScenarioApi.getScenario(scenarioId);
          const section = scenario.sections?.find((s) => s.id === sectionId);
          const updatedTc = section?.testCases.find(
            (tc) => tc.id === testCase.id,
          );

          if (
            updatedTc?.automationTest &&
            updatedTc.automationTest.status !== "running"
          ) {
            clearPolling();
            onTestCaseUpdate(updatedTc);
            onUpdateState((prev) => {
              if (!prev || prev.testCaseId !== testCase.id) return prev;
              return {
                ...prev,
                phase: "completed",
                result:
                  updatedTc.automationTest!.status === "pass" ? "pass" : "fail",
              };
            });
            setTimeout(() => onUpdateState(null), 800);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }

    return () => clearPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(async () => {
    clearPolling();

    onUpdateState({
      testCaseId: testCase.id,
      phase: "running",
      currentStepIndex: 0,
      completedStepIds: new Set(),
      result: null,
    });

    try {
      await testScenarioApi.runScenarioTestCase(
        scenarioId,
        sectionId,
        testCase.id,
      );
    } catch (err) {
      console.error("Failed to start test:", err);
      onUpdateState((prev) => {
        if (!prev || prev.testCaseId !== testCase.id) return prev;
        return {
          ...prev,
          phase: "completed",
          result: "fail",
          errorMessage:
            err instanceof Error
              ? err.message
              : "Failed to start test execution",
        };
      });
      setTimeout(() => onUpdateState(null), 2000);
      return;
    }

    // Start polling for completion
    intervalRef.current = setInterval(async () => {
      try {
        const scenario = await testScenarioApi.getScenario(scenarioId);
        const section = scenario.sections?.find((s) => s.id === sectionId);
        const updatedTc = section?.testCases.find(
          (tc) => tc.id === testCase.id,
        );

        if (
          updatedTc?.automationTest &&
          updatedTc.automationTest.status !== "running"
        ) {
          clearPolling();
          onTestCaseUpdate(updatedTc);
          onUpdateState((prev) => {
            if (!prev || prev.testCaseId !== testCase.id) return prev;
            return {
              ...prev,
              phase: "completed",
              result:
                updatedTc.automationTest!.status === "pass" ? "pass" : "fail",
            };
          });
          setTimeout(() => onUpdateState(null), 800);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  }, [
    scenarioId,
    sectionId,
    testCase,
    onUpdateState,
    onTestCaseUpdate,
    clearPolling,
  ]);

  const cancel = useCallback(() => {
    clearPolling();
    onUpdateState((prev) => (prev ? { ...prev, phase: "cancelled" } : prev));
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
  const isRunning = runState.phase === "running";
  const isCompleted = runState.phase === "completed";
  const isCancelled = runState.phase === "cancelled";

  const message = isCompleted
    ? runState.result === "pass"
      ? "All steps completed successfully."
      : "Test failed. See details below."
    : isCancelled
      ? "Run cancelled by user."
      : "Running automation steps…";

  const progressPct =
    testCase.steps.length > 0
      ? Math.round(
          (runState.completedStepIds.size / testCase.steps.length) * 100,
        )
      : 0;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isCompleted && runState.result === "pass"
          ? "bg-emerald-50/40 border-emerald-100"
          : isCompleted && runState.result === "fail"
            ? "bg-red-50/40 border-red-100"
            : isCancelled
              ? "bg-zinc-50 border-zinc-200"
              : "bg-amber-50/30 border-amber-100",
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
              isRunning && "bg-amber-100 text-amber-700",
              isCompleted &&
                runState.result === "pass" &&
                "bg-emerald-100 text-emerald-700",
              isCompleted &&
                runState.result === "fail" &&
                "bg-red-100 text-red-700",
              isCancelled && "bg-zinc-100 text-zinc-400",
            )}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted && runState.result === "pass" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isCompleted && runState.result === "fail" ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">
              {isRunning
                ? "Running Automation Test"
                : isCompleted
                  ? runState.result === "pass"
                    ? "Passed"
                    : "Failed"
                  : "Cancelled"}
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
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all",
                isCurrent && "bg-amber-50 border border-amber-100",
                isCompleted && !isCurrent && "text-zinc-500",
                !isCompleted && !isCurrent && "text-zinc-300",
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border",
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : isCurrent
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-zinc-50 border-zinc-100 text-zinc-300",
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
                  "truncate flex-1",
                  isCurrent && "font-medium text-zinc-900",
                  isCompleted && "line-through opacity-70",
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
    runState?.testCaseId === testCase.id && runState.phase === "running";

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
          onClick={(e) => {
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
        "h-7 w-7 p-0 rounded-md transition-colors",
        hasAutomation
          ? "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onStart();
      }}
      title={hasAutomation ? "Re-run test" : "Run test"}
    >
      {hasAutomation ? (
        <RotateCcw className="w-3.5 h-3.5" />
      ) : (
        <Play className="w-3.5 h-3.5" />
      )}
    </Button>
  );
};

// ─────────────────────────────────────────────
// Sortable Test Case Wrapper
// ─────────────────────────────────────────────
const SortableTestCase: React.FC<{
  scenarioId: string;
  projectId?: string;
  sectionId: string;
  testCase: TestCase;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (tc: TestCase, options?: { persist?: boolean }) => void;
  onAutomationCategoryChange: (
    testCase: TestCase,
    category: AutomationCategory,
  ) => Promise<void>;
  runState: TestRunState | null;
  onRunStateChange: React.Dispatch<React.SetStateAction<TestRunState | null>>;
}> = ({
  scenarioId,
  projectId,
  sectionId,
  testCase,
  isExpanded,
  onToggle,
  onUpdate,
  onAutomationCategoryChange,
  runState,
  onRunStateChange,
}) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AutomationCategory>(
    inferAutomationCategory(testCase),
  );

  React.useEffect(() => {
    setSelectedCategory(inferAutomationCategory(testCase));
  }, [testCase.automationType, testCase.automationTest?.category]);

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
    (updatedTc) => {
      onUpdate(updatedTc);
    },
  );

  const categoryMutation = useMutation({
    mutationFn: (category: AutomationCategory) =>
      onAutomationCategoryChange(testCase, category),
    onMutate: (category) => {
      setSelectedCategory(category);
    },
    onSuccess: () => {
      toast.success("Automation category updated");
    },
    onError: (error) => {
      setSelectedCategory(inferAutomationCategory(testCase));
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update automation category",
      );
    },
  });

  const handleCategoryChange = (category: AutomationCategory) => {
    if (categoryMutation.isPending || category === selectedCategory) return;
    categoryMutation.mutate(category);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const automationState = testCase.automationTest
    ? testCase.automationTest.status === "pass"
      ? "ring-1 ring-emerald-100 bg-emerald-50/10"
      : testCase.automationTest.status === "fail"
        ? "ring-1 ring-red-100 bg-red-50/10"
        : testCase.automationTest.status === "running"
          ? "ring-1 ring-amber-100 bg-amber-50/10"
          : "ring-1 ring-zinc-100"
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border transition-colors group/testcase",
        automationState,
        isDragging
          ? "border-zinc-300 shadow-lg bg-white"
          : "border-zinc-200/70 bg-white hover:border-zinc-300 hover:shadow-sm hover:shadow-zinc-950/[0.03]",
      )}
    >
      {/* Collapsed Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-zinc-50"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Code */}
        <span className="shrink-0 font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200/70 px-2 py-1 rounded-md">
          {testCase.code}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-950 truncate">
            {testCase.title}
          </p>
        </div>

        {/* Meta badges */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {testCase.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md max-w-28 truncate"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          <PriorityBadge priority={testCase.priority} />
          <TestCaseStatusBadge testCase={testCase} />
          <AutomationCategorySelect
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={categoryMutation.isPending}
          />
          <AutomationBadge test={testCase.automationTest} />

          {/* View detail */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            onClick={(e) => {
              e.stopPropagation();
              setDetailOpen(true);
            }}
            title="View details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {/* Run / Re-run button */}
          {selectedCategory === "e2e" && (
            <RunButton
              testCase={testCase}
              runState={runState}
              onStart={runner.start}
              onCancel={runner.cancel}
            />
          )}

          <div className="flex items-center gap-1 text-[11px] text-zinc-400 ml-1">
            <Layers className="w-3 h-3" />
            {testCase.steps.length}
          </div>
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 text-zinc-400">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
            animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
            exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
            transition={{
              height: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                restDelta: 0.01,
              },
              opacity: { duration: 0.2 },
              filter: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 border-t border-zinc-50">
              {/* Test Result / Active Run */}
              {runState &&
              runState.testCaseId === testCase.id &&
              runState.phase !== "cancelled" ? (
                <div className="mt-4">
                  <TestRunPanel
                    testCase={testCase}
                    runState={runState}
                    onCancel={runner.cancel}
                  />
                </div>
              ) : testCase.automationTest ? (
                <div className="mt-4">
                  <LastRunPanel test={testCase.automationTest} />
                </div>
              ) : null}

              {/* Concise Content */}
              <div className="mt-4 space-y-4">
                <AutomationCategoryPanel
                  scenarioId={scenarioId}
                  projectId={projectId}
                  sectionId={sectionId}
                  testCase={testCase}
                  category={selectedCategory}
                  onUpdate={onUpdate}
                />

                {/* Description */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {testCase.description || (
                      <span className="italic text-zinc-400">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                {/* Footer stats & actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 rounded-md border border-zinc-100 text-[11px] font-medium text-zinc-600">
                      <Layers className="w-3 h-3 text-zinc-400" />
                      <span>{testCase.steps.length} Steps</span>
                    </div>
                    <PriorityBadge
                      priority={testCase.priority}
                      onChange={(p) => onUpdate({ ...testCase, priority: p })}
                    />
                    <TestCaseStatusBadge testCase={testCase} />
                    <AutomationCategorySelect
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      disabled={categoryMutation.isPending}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    onClick={() => setDetailOpen(true)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Full Details
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">
            Generate Automation Tests
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Select sections to generate AI-powered automation tests from.
          </p>
        </div>
        <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
          {sections.map((section) => {
            const isSelected = selected.has(section.id);
            return (
              <div
                key={section.id}
                onClick={() => toggle(section.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                  isSelected
                    ? "border-zinc-900 bg-white shadow-sm ring-1 ring-zinc-900"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50",
                )}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {section.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {section.testCases.length} test cases ·{" "}
                    {section.testCases.filter((tc) => tc.automationTest).length}{" "}
                    already automated
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-zinc-900 border-zinc-900"
                      : "border-zinc-300 bg-white",
                  )}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
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
            Generate for {selected.size} section{selected.size !== 1 ? "s" : ""}
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
  projectId?: string;
  projectName?: string;
  onClose: () => void;
  onGenerate: (sectionIds: string[]) => void;
  onDelete: () => void;
  onUpdateScenario?: (id: string, data: any) => Promise<void>;
  onUpdateTestCase?: (
    sectionId: string,
    tcId: string,
    data: any,
  ) => Promise<void>;
  onUpdateTestCaseAutomationCategory?: (
    sectionId: string,
    tcId: string,
    category: AutomationCategory | null,
  ) => Promise<AutomationCategoryUpdateResult>;
  onReorderTestCases?: (
    sectionId: string,
    orderedIds: string[],
  ) => Promise<void>;
  onAddTestCase?: (sectionId: string, data: any) => Promise<void>;
  onDeleteTestCase?: (sectionId: string, tcId: string) => Promise<void>;
}

export const ScenarioDetail: React.FC<ScenarioDetailProps> = ({
  scenario: initialScenario,
  projectId,
  projectName,
  onClose,
  onGenerate,
  onDelete,
  onUpdateScenario,
  onUpdateTestCase,
  onUpdateTestCaseAutomationCategory,
  onReorderTestCases,
  onAddTestCase,
  onDeleteTestCase,
}) => {
  const [scenario, setScenario] = useState<TestScenario>(initialScenario);
  const nestedInProject = Boolean(projectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [runState, setRunState] = useState<TestRunState | null>(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(
    null,
  );

  const ITEMS_PER_PAGE = 10;
  const sections = scenario.sections ?? [];

  // Flatten all test cases from all sections into one list
  const allTestCases = useMemo(
    () =>
      sections.flatMap((s) =>
        s.testCases.map((tc) => ({ ...tc, _sectionId: s.id })),
      ),
    [sections],
  );

  // Derive available sections and types for sidebar filters
  const availableSections = useMemo(
    () =>
      sections.map((s) => ({
        id: s.id,
        title: `${s.title} (${s.testCases.length})`,
      })),
    [sections],
  );
  const availableTypes = useMemo<string[]>(() => {
    const types = new Set(allTestCases.map((tc) => tc.type).filter(Boolean));
    return Array.from(types).sort();
  }, [allTestCases]);
  const sectionTitleLookup = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((s) => map.set(s.id, s.title));
    return map;
  }, [sections]);
  const automationGenerationPollKey = useMemo(
    () => getAutomationGenerationPollKey(scenario),
    [scenario],
  );
  const isAutomationGenerationPending =
    hasPendingAutomationGeneration(scenario);

  // E2E generation is a backend background job. Keep polling the persisted
  // scenario while it is marked as generating/running so refreshes and long
  // running jobs do not leave the UI stuck on the optimistic local state.
  React.useEffect(() => {
    if (!isAutomationGenerationPending) return;

    let cancelled = false;
    const refreshScenario = async () => {
      try {
        const latest = await testScenarioApi.getScenario(
          scenario.id,
          projectId,
        );
        if (!cancelled) setScenario(latest);
      } catch (error) {
        console.error("Failed to poll automation generation status:", error);
      }
    };

    refreshScenario();
    const interval = window.setInterval(refreshScenario, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    scenario.id,
    projectId,
    isAutomationGenerationPending,
    automationGenerationPollKey,
  ]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Filtered test cases (flattened across all sections)
  const filteredTestCases = useMemo(() => {
    let cases = [...allTestCases];
    if (statusFilter !== "all") {
      cases = cases.filter((tc) => {
        const tcStatus = tc.processingStatus !== 'idle' ? tc.processingStatus : tc.automationStatus || 'not_generated';
        return tcStatus === statusFilter;
      });
    }
    if (sectionFilter !== "all") {
      cases = cases.filter((tc) => (tc as any)._sectionId === sectionFilter);
    }
    if (typeFilter !== "all") {
      cases = cases.filter((tc) => tc.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(
        (tc) =>
          tc.title.toLowerCase().includes(q) ||
          tc.code.toLowerCase().includes(q) ||
          tc.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return cases;
  }, [allTestCases, searchQuery, statusFilter, sectionFilter, typeFilter]);

  // Derived: selected test case
  const selectedTestCase = useMemo(() => {
    if (!selectedTestCaseId) return null;
    return (
      filteredTestCases.find((tc) => tc.id === selectedTestCaseId) || null
    );
  }, [filteredTestCases, selectedTestCaseId]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTestCases.length / ITEMS_PER_PAGE),
  );

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Drag end handler (works on flattened list, persists per-section)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = allTestCases.findIndex((tc) => tc.id === active.id);
      const newIndex = allTestCases.findIndex((tc) => tc.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder the flattened array
      const reordered = arrayMove(allTestCases, oldIndex, newIndex);
      reordered.forEach((tc, i) => (tc.order = i + 1));

      // Group the new ordering by section for persistence
      const sectionOrderMap = new Map<string, string[]>();
      reordered.forEach((tc) => {
        const secId = (tc as any)._sectionId;
        if (!sectionOrderMap.has(secId)) sectionOrderMap.set(secId, []);
        sectionOrderMap.get(secId)!.push(tc.id);
      });

      // Update local state
      setScenario((prev) => ({
        ...prev,
        sections: (prev.sections ?? []).map((s) => ({
          ...s,
          testCases: reordered
            .filter((tc) => (tc as any)._sectionId === s.id)
            .map((tc, i) => ({ ...tc, order: i + 1 })),
        })),
      }));

      // Persist per-section reorder
      if (onReorderTestCases) {
        sectionOrderMap.forEach((orderedIds, secId) => {
          onReorderTestCases(secId, orderedIds).catch(console.error);
        });
      }
    },
    [allTestCases, onReorderTestCases],
  );

  // Update a test case
  const updateTestCase = useCallback(
    (
      sectionId: string,
      updated: TestCase,
      options: { persist?: boolean } = {},
    ) => {
      setScenario((prev) => ({
        ...prev,
        sections: (prev.sections ?? []).map((s) =>
          s.id === sectionId
            ? {
                ...s,
                testCases: s.testCases.map((tc) =>
                  tc.id === updated.id ? updated : tc,
                ),
              }
            : s,
        ),
      }));

      if (options.persist !== false && onUpdateTestCase) {
        onUpdateTestCase(sectionId, updated.id, updated).catch(console.error);
      }
    },
    [onUpdateTestCase],
  );

  const updateAutomationCategory = useCallback(
    async (
      sectionId: string,
      testCase: TestCase,
      category: AutomationCategory,
    ) => {
      const result = onUpdateTestCaseAutomationCategory
        ? await onUpdateTestCaseAutomationCategory(
            sectionId,
            testCase.id,
            category,
          )
        : await testScenarioApi.updateTestCaseAutomationCategory(
            scenario.id,
            testCase.id,
            category,
            {
              projectId,
              sectionId,
            },
          );

      const updatedScenario = extractScenarioResult(result);
      if (updatedScenario) {
        setScenario(updatedScenario);
        return;
      }

      const updatedTestCase =
        extractTestCaseResult(result) ||
        withAutomationCategory(testCase, category);
      updateTestCase(sectionId, updatedTestCase, { persist: false });
    },
    [
      onUpdateTestCaseAutomationCategory,
      projectId,
      scenario.id,
      updateTestCase,
    ],
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
    totalTestCases: sections.reduce((a, s) => a + s.testCases.length, 0),
    totalSteps: sections.reduce(
      (a, s) => a + s.testCases.reduce((b, tc) => b + tc.steps.length, 0),
      0,
    ),
    generatedCount: 0,
    notGeneratedCount: 0,
    generatingCount: 0,
    generationFailedCount: 0,
    idleCount: 0,
    runningCount: 0,
    passCount: 0,
    failCount: 0,
    coveragePercent: 0,
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* ─── TopAppBar ─── */}
      <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        {/* Left: Back */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Scenario Title */}
        <div className="flex-1 flex justify-center min-w-0 px-4">
          <h2 className="text-base font-semibold text-zinc-900 truncate max-w-md">
            {scenario.title}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 px-4 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run Scenario
          </Button>
          <div className="flex items-center gap-0.5 border-l border-zinc-200 pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {scenario.error && (
        <div className="shrink-0 mx-4 lg:mx-6 mt-3 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800 text-sm">
              Generation Failed
            </p>
            <p className="text-sm text-red-600 mt-0.5">{scenario.error}</p>
          </div>
        </div>
      )}

      {/* Split View Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── Left Sidebar: Test Cases List ── */}
        <aside className="w-[300px] shrink-0 border-r border-zinc-200 bg-[#F9FAFB] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Test Cases
            </h3>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
              {filteredTestCases.length}
            </span>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-zinc-200 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                placeholder="Filter cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-[#F9FAFB] border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
              />
            </div>
          </div>

          {/* Section Filter */}
          {availableSections.length > 1 && (
            <div className="px-3 py-2 border-b border-zinc-200 bg-white">
              <Select
                value={sectionFilter}
                onValueChange={(v) => {
                  setSectionFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full h-7 text-xs rounded-md bg-[#F9FAFB] border border-zinc-200 text-zinc-600 focus:outline-none focus:border-zinc-400 px-2">
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {availableSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type Filter */}
          {availableTypes.length > 1 && (
            <div className="px-3 py-2 border-b border-zinc-200 bg-white">
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full h-7 text-xs rounded-md bg-[#F9FAFB] border border-zinc-200 text-zinc-600 focus:outline-none focus:border-zinc-400 px-2">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {availableTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Filter */}
          <div className="px-3 py-2 border-b border-zinc-200 bg-white">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full h-7 text-xs rounded-md bg-[#F9FAFB] border border-zinc-200 text-zinc-600 focus:outline-none focus:border-zinc-400 px-2">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="generation_failed">Generation failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="idle">Generated</SelectItem>
                <SelectItem value="not_generated">Not generated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Case Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredTestCases.length > 0 ? (
              filteredTestCases
                .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                .map((tc) => {
                const isSelected = selectedTestCaseId === tc.id;
                const sectionName = sectionTitleLookup.get(
                  (tc as any)._sectionId,
                );
                return (
                  <div
                    key={tc.id}
                    onClick={() => setSelectedTestCaseId(tc.id)}
                    className={cn(
                      "px-4 py-2.5 flex flex-col justify-center border-b border-zinc-100 cursor-pointer transition-colors min-h-[52px]",
                      isSelected
                        ? "bg-white border-l-2 border-l-zinc-900 shadow-[inset_4px_0_0_0_rgba(0,0,0,0.04)]"
                        : "hover:bg-zinc-50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          "text-[11px] font-mono",
                          isSelected
                            ? "text-zinc-900 font-semibold"
                            : "text-zinc-500",
                        )}
                      >
                        {tc.code}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-800 truncate leading-tight mb-0.5">
                      {tc.title}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sectionName && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          {sectionName}
                        </span>
                      )}
                      {tc.type && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1 rounded">
                          {tc.type}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] px-1 rounded",
                          tc.priority === "critical" &&
                            "text-red-600 bg-red-50",
                          tc.priority === "high" &&
                            "text-orange-600 bg-orange-50",
                          tc.priority === "medium" &&
                            "text-amber-600 bg-amber-50",
                          tc.priority === "low" &&
                            "text-zinc-500 bg-zinc-100",
                        )}
                      >
                        {(PRIORITY_META[tc.priority]?.label) ?? tc.priority}
                      </span>
                      {(() => {
                        const cat = inferAutomationCategory(tc);
                        const catMeta = CATEGORY_META[cat] ?? { label: cat, icon: null, description: '', classes: '' };
                        return (
                          <span
                            className={cn(
                              "text-[10px] px-1 rounded",
                              cat === "api" && "text-sky-600 bg-sky-50",
                              cat === "e2e" && "text-violet-600 bg-violet-50",
                              cat === "manual" &&
                                "text-zinc-500 bg-zinc-100",
                            )}
                          >
                            {catMeta.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
                {searchQuery || statusFilter !== "all" || sectionFilter !== "all" || typeFilter !== "all"
                  ? "No matches"
                  : "No test cases"}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 py-2 border-t border-zinc-200 bg-white flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                {page}/{totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content: Selected Test Case Detail ── */}
        <main className="flex-1 overflow-y-auto bg-white">
          {selectedTestCase ? (
            <div className="max-w-3xl mx-auto p-6 pb-6">
              {/* Header Data */}
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[11px] font-mono px-2 py-1 bg-zinc-50 text-zinc-600 rounded border border-zinc-200">
                    {selectedTestCase.code}
                  </span>
                  <TestCaseStatusBadge testCase={selectedTestCase} />
                  <PriorityBadge priority={selectedTestCase.priority} />
                  <AutomationCategorySelect
                    value={inferAutomationCategory(selectedTestCase)}
                    onChange={(category) =>
                      updateAutomationCategory(
                        (selectedTestCase as any)._sectionId,
                        selectedTestCase,
                        category,
                      )
                    }
                  />
                </div>
                <h1 className="text-lg font-semibold text-zinc-900 mb-3 leading-snug">
                  {selectedTestCase.title}
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {selectedTestCase.description || (
                    <span className="italic text-zinc-300">
                      No description provided.
                    </span>
                  )}
                </p>
              </div>

              {/* Automation Category Panel */}
              <div className="mb-6">
                <AutomationCategoryPanel
                  scenarioId={scenario.id}
                  projectId={projectId || scenario.projectId}
                  sectionId={(selectedTestCase as any)._sectionId}
                  testCase={selectedTestCase}
                  category={inferAutomationCategory(selectedTestCase)}
                  onUpdate={(updated) =>
                    updateTestCase(
                      (selectedTestCase as any)._sectionId,
                      updated,
                    )
                  }
                />
              </div>

              {/* Environment & Meta */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Environment
                  </span>
                  <span className="text-sm text-zinc-800 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-zinc-400" />
                    {scenario.projectName || "N/A"}
                  </span>
                </div>
                <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Platform
                  </span>
                  <span className="text-sm text-zinc-800 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    Web
                  </span>
                </div>
                <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Assignee
                  </span>
                  <span className="text-sm text-zinc-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-[10px] font-medium">
                      {scenario.creatorId
                        ? String(scenario.creatorId).slice(0, 2).toUpperCase()
                        : "?"}
                    </span>
                    {scenario.creatorId
                      ? `User #${scenario.creatorId}`
                      : "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Steps Table */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                  Execution Steps
                </h3>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 bg-[#F9FAFB] border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <div className="text-center">#</div>
                    <div>Action</div>
                    <div>Expected Result</div>
                  </div>
                  {/* Rows */}
                  {selectedTestCase.steps.map((step) => (
                    <div
                      key={step.id}
                      className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 border-b border-zinc-100 last:border-b-0 items-start hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="text-[11px] font-mono text-zinc-400 text-center pt-1">
                        {step.order}
                      </div>
                      <div className="text-sm text-zinc-800 leading-snug">
                        {step.action}
                      </div>
                      <div className="text-sm text-zinc-500 leading-snug">
                        {step.expected}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence & Artifacts */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                  Evidence &amp; Artifacts
                </h3>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 bg-zinc-50/30 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-700 mb-1">
                    Drag and drop screenshots or screen recordings here
                  </p>
                  <p className="text-xs text-zinc-400 mb-4">
                    Supports PNG, JPG, MP4 (Max 50MB)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs border-zinc-200 text-zinc-600"
                  >
                    Browse Files
                  </Button>
                </div>
              </div>

              {/* Execution Result (for non-manual types - Manual panel handles this above) */}
              {inferAutomationCategory(selectedTestCase) !== "manual" && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                    Execution Result
                  </h3>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/30 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500 font-medium">
                        Status:
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-emerald-500 border-zinc-300 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-zinc-700 group-hover:text-emerald-600 transition-colors">
                            Pass
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-red-500 border-zinc-300 focus:ring-red-500"
                          />
                          <span className="text-xs text-zinc-700 group-hover:text-red-600 transition-colors">
                            Fail
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-amber-500 border-zinc-300 focus:ring-amber-500"
                          />
                          <span className="text-xs text-zinc-700 group-hover:text-amber-600 transition-colors">
                            Block
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <textarea
                        placeholder="Add notes about this execution result..."
                        className="w-full min-h-[60px] text-sm border border-zinc-200 rounded-lg p-2.5 bg-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 resize-y"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="h-8 px-4 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs shadow-sm"
                      >
                        Submit Result
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-8">
                <FileSpreadsheet className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-600 mb-1">
                  Select a test case
                </p>
                <p className="text-xs text-zinc-400">
                  Choose a test case from the sidebar to view its details and
                  steps.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────
// Metric Item (for header metrics bar)
// ─────────────────────────────────────────────
function MetricItem({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5 shrink-0">
      <span
        className={cn(
          "text-xl font-bold tabular-nums leading-none",
          danger
            ? "text-red-600"
            : accent
              ? "text-emerald-600"
              : "text-zinc-950",
        )}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
