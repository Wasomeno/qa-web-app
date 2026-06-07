import React, { useState, useMemo, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  Server,
  Monitor,
  ClipboardCheck,
  Copy,
  X,
  SlidersHorizontal,
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
import { ProjectSelect } from "@/components/project-select";
import { DescriptionEditor } from "@/pages/issues/create/components/description-editor";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { uploadService } from "@/services/upload";
import { useStreamEvents, StreamEvent } from "@/pages/agent/hooks/use-stream-events";
import { TestScenarioChatAgent } from "./test-scenario-chat-agent";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
export const ScenarioDetailSkeleton: React.FC<{ nested?: boolean }> = ({
  nested = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* TopAppBar Skeleton */}
      <header className="h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex-1 flex justify-center px-4">
          <Skeleton className="h-5 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Split View Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-[300px] shrink-0 border-r border-border bg-background flex flex-col">
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-8 rounded" />
          </div>
          <div className="p-3 border-b border-border bg-card">
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <div className="px-3 py-2 border-b border-border bg-card">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="px-3 py-2 border-b border-border bg-card">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="px-3 py-2 border-b border-border bg-card">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="px-4 py-2.5 border-b border-border"
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
          <div className="px-3 py-2 border-t border-border bg-card flex items-center justify-between">
            <Skeleton className="h-3 w-8 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        </aside>

        {/* Content Skeleton */}
        <main className="flex-1 overflow-y-auto bg-background">
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
                <div key={i} className="p-3 border border-border rounded-lg">
                  <Skeleton className="h-3 w-20 rounded mb-2" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))}
            </div>

            {/* Steps Table */}
            <div className="mb-6">
              <Skeleton className="h-5 w-32 rounded mb-3" />
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 bg-muted/50 border-b border-border">
                  <Skeleton className="h-3 w-4 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 border-b border-border"
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
          "cursor-text group relative rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-muted",
          isEmpty && "italic text-muted-foreground",
          className,
        )}
      >
        <span className={isEmpty ? "" : ""}>
          {isEmpty ? placeholder : value}
        </span>
        <Pencil className="w-3 h-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2 transition-opacity" />
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
      "w-full bg-background border-border focus:border-border focus:ring-1 focus:ring-ring/50 rounded-md text-inherit",
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
  low: { label: "Low", classes: "bg-muted text-foreground border-border" },
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
  const meta = PRIORITY_META[priority] ?? { label: priority, classes: 'bg-muted text-foreground border-border' };
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
        <div className="absolute z-50 mt-1 w-28 bg-card border border-border rounded-lg shadow-lg py-1">
          {(Object.keys(PRIORITY_META) as Priority[]).map((p: Priority) => (
            <button
              key={p}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors flex items-center justify-between",
                p === priority && "bg-muted",
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
              {p === priority && <Check className="w-3 h-3 text-muted-foreground" />}
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
  Generated: 'bg-muted text-muted-foreground border-border',
  'Not generated': 'bg-muted text-muted-foreground border-border',
};

const TestCaseStatusBadge: React.FC<{ testCase: TestCase }> = ({ testCase }) => {
  const label = getTestCaseDisplayStatus(testCase);
  const classes = TEST_CASE_STATUS_CLASSES[label] ?? 'bg-muted text-muted-foreground border-border';
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
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
      classes: "bg-muted text-muted-foreground border-border",
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

  const m = meta[test.status] ?? { icon: <Clock className="w-3 h-3" />, classes: 'bg-muted text-muted-foreground border-border' };
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
    classes: "bg-muted text-foreground border-border",
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

function hasGeneratedE2EAutomation(testCase: TestCase): boolean {
  return Boolean(
    testCase.automationTest?.category === "e2e" &&
      (testCase.automationTest.steps?.length ?? 0) > 0,
  );
}

function getAutomationStepKey(index: number): string {
  return `automation-step-${index}`;
}

const AutomationCategorySelect: React.FC<{
  value: AutomationCategory;
  onChange: (category: AutomationCategory) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const meta = CATEGORY_META[value] ?? { label: value, icon: null, description: '', classes: 'bg-muted text-foreground border-border' };
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
            "h-7 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors cursor-pointer",
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
    <div className="px-4 py-3 border-b border-border">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Generated Steps
      </p>
      <div className="space-y-1.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs bg-card rounded-md px-2.5 py-2 border border-border"
          >
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground w-4 mt-0.5">
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
                    <span className="font-mono text-[11px] text-foreground break-all">
                      {step.apiEndpoint || step.value}
                    </span>
                    {step.assertionType && (
                      <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {step.assertionType}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-muted-foreground">{step.description}</p>
                  )}
                  {step.apiPayload && step.apiPayload !== "{}" && (
                    <div className="mt-1">
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Payload
                      </span>
                      <code className="block text-[10px] text-muted-foreground bg-muted border border-border p-1.5 rounded mt-0.5 whitespace-pre-wrap break-words">
                        {step.apiPayload}
                      </code>
                    </div>
                  )}
                  {step.apiHeaders && step.apiHeaders !== "{}" && (
                    <div className="mt-1">
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Headers
                      </span>
                      <code className="block text-[10px] text-muted-foreground bg-muted border border-border p-1.5 rounded mt-0.5 whitespace-pre-wrap break-words">
                        {step.apiHeaders}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {step.action}
                  </span>
                  {step.description && (
                    <span className="text-muted-foreground ml-1">
                      — {step.description}
                    </span>
                  )}
                  {step.selector && (
                    <code className="block text-[10px] text-muted-foreground mt-0.5 truncate">
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
            : "bg-muted border-border",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isPass && "border-b border-emerald-100/60",
          isFail && "border-b border-red-100/60",
          !isPass && !isFail && "border-b border-border",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              isPass && "bg-emerald-100 text-emerald-700",
              isFail && "bg-red-100 text-red-700",
              !isPass && !isFail && "bg-muted text-muted-foreground",
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
                !isPass && !isFail && "text-foreground",
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
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              {timeAgo && <span>{timeAgo}</span>}
              {test.runDurationMs && (
                <>
                  <span className="text-muted-foreground/60">·</span>
                  <span>{(test.runDurationMs / 1000).toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      {test.videoUrl && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Log
          </p>
          <pre className="text-[11px] text-muted-foreground bg-muted rounded-md p-2.5 overflow-auto max-h-[120px] whitespace-pre-wrap">
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

const AutomationCategoryPanel: React.FC<{
  scenarioId: string;
  projectId?: string;
  sectionId: string;
  testCase: TestCase;
  category: AutomationCategory;
  onUpdate: (tc: TestCase) => void;
  runState?: TestRunState | null;
  onRunStateChange?: React.Dispatch<React.SetStateAction<TestRunState | null>>;
}> = ({
  scenarioId,
  projectId,
  sectionId,
  testCase,
  category,
  onUpdate,
  runState,
  onRunStateChange,
}) => {
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
      <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
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
        runState={runState}
        onRunStateChange={onRunStateChange}
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

type PipelineStep = "configure" | "generate" | "review";

const PipelineSteps: React.FC<{
  steps: { key: PipelineStep; label: string }[];
  current: PipelineStep;
}> = ({ steps, current }) => {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const state =
          i < idx ? "done" : i === idx ? "active" : "pending";
        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px flex-1 mx-1.5",
                  state === "done" || state === "active"
                    ? "bg-muted"
                    : "bg-muted",
                )}
              />
            )}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors",
                  state === "done" && "bg-zinc-900 text-white",
                  state === "active" && "bg-zinc-900 text-white ring-2 ring-foreground/20",
                  state === "pending" && "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap transition-colors",
                  state === "done" && "text-foreground",
                  state === "active" && "text-foreground font-semibold",
                  state === "pending" && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
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
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({
        queryKey: projectId
          ? ["test-scenario", projectId, scenarioId]
          : ["test-scenario", scenarioId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate API prompt",
      ),
  });

  const pipelineStep: PipelineStep = mutation.isPending
    ? "generate"
    : prompt
      ? "review"
      : "configure";

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Pipeline Header */}
      <PipelineSteps
        steps={[
          { key: "configure", label: "Configure" },
          { key: "generate", label: "Generate" },
          { key: "review", label: "Review" },
        ]}
        current={pipelineStep}
      />

      {/* Step 1: Configure */}
      <AnimatePresence mode="wait">
        {pipelineStep === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                Backend prompt
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                Select the backend repo. The result is a compact prompt for a
                developer's local coding agent.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Backend repository
              </label>
              <ProjectSelect
                value={backendRepoId ? Number(backendRepoId) : null}
                onSelect={(project) =>
                  setBackendRepoId(project ? String(project.id) : "")
                }
                placeholder="Select a project..."
                className="h-10 rounded-lg"
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                className="h-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-4 text-xs shadow-sm"
                disabled={!backendRepoId}
                onClick={() => mutation.mutate()}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Generate prompt
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {pipelineStep === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Generating prompt
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Analyzing backend repo structure…
            </p>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {pipelineStep === "review" && prompt && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Generated prompt
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Copy this prompt into your development environment.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs border-border text-muted-foreground hover:bg-muted"
                  disabled={!backendRepoId || mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs border-border text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    navigator.clipboard?.writeText(prompt);
                    toast.success("Prompt copied to clipboard");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-foreground p-4 text-xs leading-relaxed text-background font-mono">
              {prompt}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
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
  runState?: TestRunState | null;
  onRunStateChange?: React.Dispatch<React.SetStateAction<TestRunState | null>>;
}> = ({
  scenarioId,
  projectId,
  sectionId,
  testCase,
  frontendRepoId,
  setFrontendRepoId,
  onUpdate,
  runState,
  onRunStateChange,
}) => {
  const queryClient = useQueryClient();
  const [localRunState, setLocalRunState] = useState<TestRunState | null>(null);
  const resolvedRunState = onRunStateChange ? runState ?? null : localRunState;
  const setResolvedRunState = onRunStateChange ?? setLocalRunState;
  const runner = useTestRunner(
    scenarioId,
    projectId,
    sectionId,
    testCase,
    resolvedRunState?.testCaseId === testCase.id ? resolvedRunState : null,
    setResolvedRunState,
    onUpdate,
  );

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
      queryClient.invalidateQueries({
        queryKey: projectId
          ? ["test-scenario", projectId, scenarioId]
          : ["test-scenario", scenarioId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start E2E generation",
      ),
  });

  const isRunningThisTest =
    resolvedRunState?.testCaseId === testCase.id &&
    resolvedRunState.phase !== "cancelled";
  const isGenerated = hasGeneratedE2EAutomation(testCase);
  const hasRunResult =
    testCase.automationTest?.status === "pass" ||
    testCase.automationTest?.status === "fail";

  const pipelineStep: PipelineStep = mutation.isPending
    ? "generate"
    : testCase.automationTest?.status === "running" && !isGenerated
      ? "generate"
      : isGenerated || hasRunResult
        ? "review"
        : "configure";

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Pipeline Header */}
      <PipelineSteps
        steps={[
          { key: "configure", label: "Configure" },
          { key: "generate", label: "Generate" },
          { key: "review", label: "Run" },
        ]}
        current={pipelineStep}
      />

      {/* Step 1: Configure */}
      <AnimatePresence mode="wait">
        {pipelineStep === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                Browser automation
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                Select the frontend repo. Generation runs in the background and
                saves executable steps.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Frontend repository
              </label>
              <ProjectSelect
                value={frontendRepoId ? Number(frontendRepoId) : null}
                onSelect={(project) =>
                  setFrontendRepoId(project ? String(project.id) : "")
                }
                placeholder="Select a project..."
                className="h-10 rounded-lg"
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                className="h-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-4 text-xs shadow-sm"
                disabled={!frontendRepoId}
                onClick={() => mutation.mutate()}
              >
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Generate E2E
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Generating / Running */}
        {pipelineStep === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {mutation.isPending
                ? "Starting generation…"
                : "Generating E2E tests"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mutation.isPending
                ? "Preparing the generation pipeline."
                : "Analyzing frontend repo and generating Playwright steps."}
            </p>
          </motion.div>
        )}

        {/* Step 3: Review / Run Results */}
        {pipelineStep === "review" && testCase.automationTest && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Generated E2E automation
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {testCase.automationTest.steps?.length ?? 0} executable steps
                  are ready for the browser runner.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-border text-muted-foreground hover:bg-muted px-3 text-xs"
                  disabled={!frontendRepoId || mutation.isPending || isRunningThisTest}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-3 text-xs shadow-sm"
                  disabled={!isGenerated || isRunningThisTest}
                  onClick={runner.start}
                >
                  {isRunningThisTest ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isRunningThisTest ? "Running" : "Run"}
                </Button>
              </div>
            </div>

            {isRunningThisTest && resolvedRunState ? (
              <TestRunPanel
                testCase={testCase}
                runState={resolvedRunState}
                onCancel={runner.cancel}
              />
            ) : (
              <LastRunPanel test={testCase.automationTest} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-foreground">Manual execution</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          Describe the outcome, paste screenshots, and attach supporting files.
        </p>
      </div>

      {/* Result */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Result
        </label>
        <Select value={status} onValueChange={(v) => setStatus(v as ManualTestStatus)}>
          <SelectTrigger
            className={cn(
              "h-10 w-full max-w-[200px] rounded-lg border bg-background px-3 text-sm outline-none transition-colors",
              status === "passed"
                ? "border-emerald-200 text-emerald-700 focus:ring-emerald-300"
                : "border-red-200 text-red-700 focus:ring-red-300",
            )}
          >
            <SelectValue placeholder="Select result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passed">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Passed
              </span>
            </SelectItem>
            <SelectItem value="failed">
              <span className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                Failed
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* WYSIWYG Editor */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Notes &amp; evidence
        </label>
        <DescriptionEditor
          content={description}
          onChange={setDescription}
          placeholder="Describe what was verified, paste screenshots (Cmd+V), or write notes..."
          onAttachFile={() => fileInputRef.current?.click()}
          projectId={projectId}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {files.map((file, i) => (
              <span
                key={`${file.name}-${i}`}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
              >
                {file.name}
                <button
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3">
        <Button
          size="sm"
          className="h-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-4 text-xs shadow-sm"
          disabled={!description.trim() || submit.isPending}
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

      {/* Recent Results — Compact Timeline */}
      {results.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Recent results
          </p>
          <div className="space-y-0">
            {results.slice(0, 3).map((result, idx) => (
              <React.Fragment key={result.id}>
                <div className="flex gap-3 py-2.5">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full ring-2 ring-white shrink-0",
                        result.status === "passed"
                          ? "bg-emerald-500"
                          : "bg-red-500",
                      )}
                    />
                    {idx < Math.min(results.length, 3) - 1 && (
                      <div className="w-px flex-1 bg-muted mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          result.status === "passed"
                            ? "text-emerald-700"
                            : "text-red-700",
                        )}
                      >
                        {result.status === "passed" ? "Passed" : "Failed"}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(result.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <MarkdownRenderer
                      content={result.description}
                      className="text-sm text-foreground mt-0.5 leading-snug [&>p]:my-0 [&>p]:leading-snug [&_img]:my-1 [&_img]:max-h-48 [&_img]:rounded-md [&_img]:border [&_img]:border-border"
                      clickableImages
                    />
                    {result.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.evidence.map((file) => {
                          const sessionId = localStorage.getItem('qa_webapp_session_id');
                          const proxyUrl = `/api/files/proxy?url=${encodeURIComponent(file.url)}&session_id=${encodeURIComponent(sessionId || '')}`;
                          return (
                            <a
                              key={file.url}
                              href={proxyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {file.name}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {idx < Math.min(results.length, 3) - 1 && (
                  <div className="ml-[14px] border-b border-border/50" />
                )}
              </React.Fragment>
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
            <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
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
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md"
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
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Precondition
              </h4>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 border border-border">
                {testCase.preCondition}
              </p>
            </div>
          )}

          {/* Manual Steps */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Test Steps
            </h4>
            <div className="space-y-2">
              {testCase.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 text-sm bg-muted rounded-lg px-3 py-2.5 border border-border"
                >
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground w-5 mt-0.5">
                    {step.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">{step.action}</p>
                    {step.data && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Data: {step.data}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-0.5">
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
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Automation Test
                </h4>
                {at.framework && (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 uppercase font-mono bg-muted/50"
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
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Note
              </h4>
              <p className="text-sm text-muted-foreground">{testCase.note}</p>
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
        <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center border border-border/60 shrink-0">
          {step.order}
        </div>
        <div className="flex flex-col mt-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-muted-foreground disabled:opacity-0"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-muted-foreground disabled:opacity-0"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="bg-card rounded-lg border border-border p-3 hover:border-border transition-colors">
          <div className="text-sm text-foreground leading-snug">
            <InlineField
              value={step.action}
              onChange={(v) => onChange({ ...step, action: v })}
              inputClassName="font-medium"
            />
          </div>
          {step.data && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-muted-foreground shrink-0">Input:</span>
              <InlineField
                value={step.data}
                onChange={(v) => onChange({ ...step, data: v })}
                inputClassName="text-xs"
              />
            </div>
          )}
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-muted-foreground shrink-0">
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
  automationId?: string;
  phase: RunPhase;
  currentStepIndex: number;
  completedStepIds: Set<string>;
  result: "pass" | "fail" | null;
  message?: string;
  errorMessage?: string;
}

function useTestRunner(
  scenarioId: string,
  projectId: string | undefined,
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

  const findCurrentTestCase = useCallback(
    async () => {
      const scenario = await testScenarioApi.getScenario(scenarioId, projectId);
      const section = scenario.sections?.find((s) => s.id === sectionId);
      return section?.testCases.find((tc) => tc.id === testCase.id);
    },
    [projectId, scenarioId, sectionId, testCase.id],
  );

  const refreshCurrentTestCase = useCallback(async () => {
    const updatedTc = await findCurrentTestCase();
    if (!updatedTc) return null;
    onTestCaseUpdate(updatedTc);
    return updatedTc;
  }, [findCurrentTestCase, onTestCaseUpdate]);

  const syncTerminalState = useCallback(
    (updatedTc: TestCase) => {
      if (!updatedTc.automationTest || updatedTc.automationTest.status === "running") {
        return false;
      }

      clearPolling();
      onTestCaseUpdate(updatedTc);
      onUpdateState((prev) => {
        if (!prev || prev.testCaseId !== testCase.id) return prev;
        const status = updatedTc.automationTest!.status;
        return {
          ...prev,
          phase: "completed",
          currentStepIndex: Math.max(
            prev.currentStepIndex,
            (updatedTc.automationTest?.steps?.length ?? 1) - 1,
          ),
          completedStepIds: new Set(
            (updatedTc.automationTest?.steps ?? []).map((_, index) =>
              getAutomationStepKey(index),
            ),
          ),
          result: status === "pass" ? "pass" : "fail",
          message:
            status === "pass"
              ? "All automation steps completed."
              : "Automation run failed.",
          errorMessage: updatedTc.automationTest?.errorMessage,
        };
      });
      setTimeout(() => onUpdateState(null), 1200);
      return true;
    },
    [clearPolling, onTestCaseUpdate, onUpdateState, testCase.id],
  );

  useStreamEvents({
    resourceId: testCase.automationTest?.id,
    type: "execution",
    enabled:
      !!testCase.automationTest?.id &&
      state?.testCaseId === testCase.id &&
      state.phase === "running",
    onEvent: (event: StreamEvent) => {
      if (event.type !== "execution") return;

      if (event.stage === "progress" && event.stepInfo) {
        const currentStepIndex = Math.max(event.stepInfo.currentStep - 1, 0);
        onUpdateState((prev) => {
          if (!prev || prev.testCaseId !== testCase.id) return prev;
          const completedStepIds = new Set(prev.completedStepIds);
          for (let index = 0; index < currentStepIndex; index += 1) {
            completedStepIds.add(getAutomationStepKey(index));
          }
          return {
            ...prev,
            currentStepIndex,
            completedStepIds,
            message: event.message || event.stepInfo?.stepName,
          };
        });
        return;
      }

      if (event.stage === "done" || event.stage === "error") {
        onUpdateState((prev) => {
          if (!prev || prev.testCaseId !== testCase.id) return prev;
          const completedStepIds = new Set(prev.completedStepIds);
          const stepCount = testCase.automationTest?.steps?.length ?? 0;
          if (event.stage === "done") {
            for (let index = 0; index < stepCount; index += 1) {
              completedStepIds.add(getAutomationStepKey(index));
            }
          }
          return {
            ...prev,
            currentStepIndex:
              event.stage === "done"
                ? Math.max(stepCount - 1, 0)
                : prev.currentStepIndex,
            completedStepIds,
            message: event.message,
            errorMessage:
              event.stage === "error" ? event.message : prev.errorMessage,
          };
        });

        window.setTimeout(() => {
          refreshCurrentTestCase()
            .then((updatedTc) => {
              if (updatedTc) syncTerminalState(updatedTc);
            })
            .catch((err) => console.error("Failed to refresh run result:", err));
        }, 500);
      }
    },
  });

  // If the test case is already running when the component mounts, start polling
  React.useEffect(() => {
    if (
      testCase.automationTest?.status === "running" &&
      hasGeneratedE2EAutomation(testCase) &&
      (!state || state.testCaseId !== testCase.id)
    ) {
      onUpdateState({
        testCaseId: testCase.id,
        automationId: testCase.automationTest.id,
        phase: "running",
        currentStepIndex: 0,
        completedStepIds: new Set(),
        result: null,
        message: "Waiting for execution progress...",
      });

      intervalRef.current = setInterval(async () => {
        try {
          const updatedTc = await findCurrentTestCase();
          if (updatedTc) syncTerminalState(updatedTc);
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
      automationId: testCase.automationTest?.id,
      phase: "running",
      currentStepIndex: 0,
      completedStepIds: new Set(),
      result: null,
      message: "Starting test execution...",
    });

    try {
      await testScenarioApi.runScenarioTestCase(
        scenarioId,
        sectionId,
        testCase.id,
        projectId,
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
        const updatedTc = await findCurrentTestCase();
        if (updatedTc) syncTerminalState(updatedTc);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  }, [
    scenarioId,
    projectId,
    sectionId,
    testCase,
    onUpdateState,
    clearPolling,
    findCurrentTestCase,
    syncTerminalState,
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
  const automationSteps = testCase.automationTest?.steps ?? [];
  const totalSteps = automationSteps.length || testCase.steps.length;

  const message = isCompleted
    ? runState.result === "pass"
      ? "All steps completed successfully."
      : "Test failed. See details below."
    : isCancelled
      ? "Run cancelled by user."
      : runState.message || "Running automation steps...";

  const progressPct =
    totalSteps > 0
      ? Math.round(
          (runState.completedStepIds.size / totalSteps) * 100,
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
              ? "bg-muted border-border"
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
              isCancelled && "bg-muted text-muted-foreground",
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
            <p className="text-sm font-semibold text-foreground truncate">
              {isRunning
                ? "Running Automation Test"
                : isCompleted
                  ? runState.result === "pass"
                    ? "Passed"
                    : "Failed"
                  : "Cancelled"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{message}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50"
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
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-amber-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">
              {runState.completedStepIds.size} of {totalSteps} steps
            </span>
            <span className="text-[10px] text-muted-foreground">{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Step list */}
      <div className="px-4 pb-4 space-y-1.5">
        {automationSteps.length > 0 ? (
          automationSteps.map((step, idx) => {
          const stepKey = getAutomationStepKey(idx);
          const isCompleted = runState.completedStepIds.has(stepKey);
          const isCurrent = isRunning && idx === runState.currentStepIndex;

          return (
            <div
              key={stepKey}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all",
                isCurrent && "bg-amber-50 border border-amber-100",
                isCompleted && !isCurrent && "text-muted-foreground",
                !isCompleted && !isCurrent && "text-muted-foreground/60",
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border",
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : isCurrent
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-muted border-border text-muted-foreground/60",
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
                  isCurrent && "font-medium text-foreground",
                  isCompleted && "line-through opacity-70",
                )}
              >
                <span className="truncate">
                  {step.action}
                  {step.description ? `: ${step.description}` : ""}
                </span>
              </span>
            </div>
          );
          })
        ) : (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            Generated automation steps are not available yet.
          </div>
        )}
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
  const canRun = hasGeneratedE2EAutomation(testCase);

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
        !canRun
          ? "text-muted-foreground/40 cursor-not-allowed"
          : hasAutomation
          ? "text-muted-foreground hover:text-foreground hover:bg-muted"
          : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50",
      )}
      disabled={!canRun}
      onClick={(e) => {
        e.stopPropagation();
        if (!canRun) return;
        onStart();
      }}
      title={
        canRun
          ? hasAutomation
            ? "Re-run test"
            : "Run test"
          : "Generate E2E automation before running"
      }
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
    projectId,
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
          : "ring-1 ring-border"
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border transition-colors group/testcase",
        automationState,
        isDragging
          ? "border-border shadow-lg bg-card"
          : "border-border/70 bg-card hover:border-border hover:shadow-sm hover:shadow-foreground/[0.03]",
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
          className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Code */}
        <span className="shrink-0 font-mono text-[11px] font-semibold text-muted-foreground bg-muted border border-border/70 px-2 py-1 rounded-md">
          {testCase.code}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {testCase.title}
          </p>
          {testCase.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {testCase.description}
            </p>
          )}
        </div>

        {/* Meta badges */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {testCase.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md max-w-28 truncate"
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
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
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

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-1">
            <Layers className="w-3 h-3" />
            {testCase.steps.length}
          </div>
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 text-muted-foreground">
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
            <div className="px-4 pb-5 border-t border-border/50">
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
                {/* Execution Steps */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Execution Steps
                  </label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[40px_1fr_1fr] gap-3 p-2.5 bg-muted/50 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="text-center">#</div>
                      <div>Action</div>
                      <div>Expected Result</div>
                    </div>
                    {testCase.steps.map((step) => (
                      <div
                        key={step.id}
                        className="grid grid-cols-[40px_1fr_1fr] gap-3 p-2.5 border-b border-border last:border-b-0 items-start hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-[10px] font-mono text-muted-foreground text-center pt-0.5">
                          {step.order}
                        </div>
                        <div className="text-xs text-foreground leading-snug">
                          {step.action}
                        </div>
                        <div className="text-xs text-muted-foreground leading-snug">
                          {step.expected}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AutomationCategoryPanel
                  scenarioId={scenarioId}
                  projectId={projectId}
                  sectionId={sectionId}
                  testCase={testCase}
                  category={selectedCategory}
                  onUpdate={onUpdate}
                  runState={runState}
                  onRunStateChange={onRunStateChange}
                />

                {/* Description */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {testCase.description || (
                      <span className="italic text-muted-foreground">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                {/* Footer stats & actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md border border-border text-[11px] font-medium text-muted-foreground">
                      <Layers className="w-3 h-3 text-muted-foreground" />
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
                    className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
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
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Generate Automation Tests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
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
                    ? "border-foreground bg-card shadow-sm ring-1 ring-foreground"
                    : "border-border hover:border-border hover:bg-muted/50",
                )}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.testCases.length} test cases ·{" "}
                    {section.testCases.filter((tc) => tc.automationTest).length}{" "}
                    already automated
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-zinc-900 border-foreground"
                      : "border-border bg-background",
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
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
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
    <div className="flex flex-col h-full bg-background">
      {/* ─── TopAppBar ─── */}
      <header className="min-h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        {/* Left: Back */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-9 w-9 p-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Scenario Title & Description */}
        <div className="flex-1 flex flex-col justify-center min-w-0 px-4 py-2">
          <h2 className="text-base font-semibold text-foreground truncate max-w-md">
            {scenario.title}
          </h2>
          {scenario.description && (
            <p className="text-xs text-muted-foreground truncate max-w-md leading-tight mt-0.5">
              {scenario.description}
            </p>
          )}
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
        <aside className="w-[300px] shrink-0 border-r border-border bg-background flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Test Cases
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {filteredTestCases.length}
            </span>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                placeholder="Filter cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-muted/30 border border-border rounded-lg text-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="px-3 py-2 border-b border-border bg-card">
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
                  <SlidersHorizontal className="w-3 h-3" />
                  Filters
                  {[sectionFilter !== "all", typeFilter !== "all", statusFilter !== "all"].filter(Boolean).length > 0 && (
                    <span className="ml-0.5 bg-foreground text-background text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {[sectionFilter !== "all", typeFilter !== "all", statusFilter !== "all"].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-60 p-3 space-y-3">
                {availableSections.length > 1 && (
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Section
                    </label>
                    <Select
                      value={sectionFilter}
                      onValueChange={(v) => { setSectionFilter(v); setPage(1); }}
                    >
                      <SelectTrigger className="w-full h-7 text-xs">
                        <SelectValue placeholder="All sections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sections</SelectItem>
                        {availableSections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {availableTypes.length > 1 && (
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Type
                    </label>
                    <Select
                      value={typeFilter}
                      onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
                    >
                      <SelectTrigger className="w-full h-7 text-xs">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {availableTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
                  >
                    <SelectTrigger className="w-full h-7 text-xs">
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
              </PopoverContent>
            </Popover>
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
                      "px-4 py-2.5 flex flex-col justify-center border-b border-border cursor-pointer transition-colors min-h-[52px]",
                      isSelected
                        ? "bg-card border-l-2 border-l-foreground shadow-[inset_4px_0_0_0_rgba(0,0,0,0.04)]"
                        : "hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          "text-[11px] font-mono",
                          isSelected
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {tc.code}
                      </span>
                    </div>
                    <span className="text-sm text-foreground truncate leading-tight mb-0.5">
                      {tc.title}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sectionName && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {sectionName}
                        </span>
                      )}
                      {tc.type && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
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
                            "text-muted-foreground bg-muted",
                        )}
                      >
                        {(PRIORITY_META[tc.priority]?.label) ?? tc.priority}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] px-1 rounded",
                          TEST_CASE_STATUS_CLASSES[getTestCaseDisplayStatus(tc)],
                        )}
                      >
                        {(tc.processingStatus === 'generating' || tc.automationStatus === 'running') && (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        )}
                        {getTestCaseDisplayStatus(tc)}
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
                                "text-muted-foreground bg-muted",
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
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" || sectionFilter !== "all" || typeFilter !== "all"
                  ? "No matches"
                  : "No test cases"}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 py-2 border-t border-border bg-card flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {page}/{totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content: Selected Test Case Detail ── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {selectedTestCase ? (
            <div className="max-w-3xl mx-auto p-6 pb-6">
              {/* Header Data */}
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[11px] font-mono px-2 py-1 bg-muted text-muted-foreground rounded border border-border">
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
                <h1 className="text-lg font-semibold text-foreground mb-3 leading-snug">
                  {selectedTestCase.title}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedTestCase.description || (
                    <span className="italic text-muted-foreground/60">
                      No description provided.
                    </span>
                  )}
                </p>
              </div>

              {/* Steps Table */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Execution Steps
                </h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="text-center">#</div>
                    <div>Action</div>
                    <div>Expected Result</div>
                  </div>
                  {/* Rows */}
                  {selectedTestCase.steps.map((step) => (
                    <div
                      key={step.id}
                      className="grid grid-cols-[40px_1fr_1fr] gap-3 p-3 border-b border-border last:border-b-0 items-start hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-[11px] font-mono text-muted-foreground text-center pt-1">
                        {step.order}
                      </div>
                      <div className="text-sm text-foreground leading-snug">
                        {step.action}
                      </div>
                      <div className="text-sm text-muted-foreground leading-snug">
                        {step.expected}
                      </div>
                    </div>
                  ))}
                </div>
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
                  runState={runState}
                  onRunStateChange={setRunState}
                />
              </div>

              {/* Execution Result (for non-manual types - Manual panel handles this above) */}
              {inferAutomationCategory(selectedTestCase) !== "manual" && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Execution Result
                  </h3>
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-medium">
                        Status:
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-emerald-500 border-border focus:ring-emerald-500"
                          />
                          <span className="text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                            Pass
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-red-500 border-border focus:ring-red-500"
                          />
                          <span className="text-xs text-foreground group-hover:text-red-600 transition-colors">
                            Fail
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="exec_status"
                            className="w-3.5 h-3.5 text-amber-500 border-border focus:ring-amber-500"
                          />
                          <span className="text-xs text-foreground group-hover:text-amber-600 transition-colors">
                            Block
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <textarea
                        placeholder="Add notes about this execution result..."
                        className="w-full min-h-[60px] text-sm border border-border rounded-lg p-2.5 bg-background placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
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
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Select a test case
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose a test case from the sidebar to view its details and
                  steps.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 48px icon nav + 300px test-cases aside = 348px content area offset */}
      <TestScenarioChatAgent
        projectId={projectId || scenario.projectId}
        projectName={projectName || scenario.projectName}
        leftOffset={348}
      />
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
              : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
