import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Database,
  CheckCircle2,
  MousePointer2,
  Type,
  Navigation,
  ListFilter,
  AlertCircle,
  Video,
  Link,
  Copy,
  Eye,
  EyeOff,
  Terminal,
  Globe,
  Bug,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { TestBlueprint } from '@/types/recording';
import { generateLLMTranscript } from '@/types/telemetry';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/* ─────────────────────────── types ─────────────────────────── */

type RightTabId = 'steps' | 'console' | 'network' | 'errors' | 'export';
type NetSubTab = 'request-headers' | 'request-payload' | 'response-headers' | 'response-payload';

/* ─────────────────────────── helpers ─────────────────────────── */

function formatPayload(payload: string): string {
  try {
    const parsed = JSON.parse(payload);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return payload;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

function getStepIcon(action: string) {
  switch (action) {
    case 'click':
      return <MousePointer2 className="w-4 h-4" />;
    case 'type':
      return <Type className="w-4 h-4" />;
    case 'navigate':
      return <Navigation className="w-4 h-4" />;
    case 'select':
      return <ListFilter className="w-4 h-4" />;
    case 'assert':
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Database className="w-4 h-4" />;
  }
}

/* ─────────────────────── StatusDot ─────────────────────────── */

const StatusDot: React.FC<{ status?: number }> = ({ status }) => {
  if (!status) return <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />;
  if (status >= 400) return <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />;
  if (status >= 300) return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />;
};

/* ─────────────────────── PlayheadStep (left pane) ──────────── */

interface PlayheadStepProps {
  step: TestBlueprint['steps'][number];
  index: number;
  isLast: boolean;
  isActive: boolean;
  onClick: () => void;
  stepContext?: import('@/types/telemetry').StepContext;
}

const PlayheadStep: React.FC<PlayheadStepProps> = ({
  step,
  index,
  isLast,
  isActive,
  onClick,
  stepContext,
}) => {
  const errorCount = stepContext?.surroundingErrors?.length ?? 0;
  const failedReqCount = stepContext?.surroundingRequests?.filter((r) => r.status && r.status >= 400).length ?? 0;

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-start gap-3 w-full text-left py-3.5 px-4 transition-colors rounded-r-lg ${
        isActive
          ? 'bg-zinc-50 border-l-2 border-zinc-900'
          : 'border-l-2 border-transparent hover:border-zinc-300 hover:bg-zinc-50/50'
      }`}
    >
      {/* Step number */}
      <span
        className={`mt-0.5 text-xs font-mono font-medium w-5 text-right shrink-0 ${
          isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'
        }`}
      >
        {index + 1}
      </span>

      {/* Icon */}
      <span
        className={`mt-0.5 shrink-0 ${
          isActive ? 'text-zinc-700' : 'text-zinc-400 group-hover:text-zinc-600'
        }`}
      >
        {getStepIcon(step.action)}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium capitalize ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
            {step.action}
          </span>
          {step.value && (
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded font-mono truncate max-w-[160px]">
              {step.value}
            </span>
          )}
        </div>
        <p className={`text-sm truncate ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
          {step.description}
        </p>
      </div>

      {/* Inline indicators */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
            <Bug className="w-3 h-3" />
            {errorCount}
          </span>
        )}
        {failedReqCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            <Globe className="w-3 h-3" />
            {failedReqCount}
          </span>
        )}
      </div>
    </button>
  );
};

/* ─────────────────────── ExpandableNetworkRow ──────────────── */

const ExpandableNetworkRow: React.FC<{
  req: import('@/types/telemetry').NetworkRequestEntry;
}> = ({ req }) => {
  const [expanded, setExpanded] = useState(false);
  const [subTab, setSubTab] = useState<NetSubTab>('request-headers');

  const hasRequestPayload = !!req.requestPayload;
  const hasResponsePayload = !!req.responsePayload;
  const hasRequestHeaders = !!req.requestHeaders && Object.keys(req.requestHeaders).length > 0;
  const hasResponseHeaders = !!req.responseHeaders && Object.keys(req.responseHeaders).length > 0;

  const subTabs: { id: NetSubTab; label: string }[] = [];
  if (hasRequestHeaders || hasResponseHeaders) subTabs.push({ id: 'request-headers', label: 'Headers' });
  if (hasRequestPayload) subTabs.push({ id: 'request-payload', label: 'Payload' });
  if (hasResponsePayload) subTabs.push({ id: 'response-payload', label: 'Response' });

  return (
    <div className="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 w-full text-left py-2.5 px-2 hover:bg-zinc-50/50 transition-colors"
      >
        <StatusDot status={req.status} />
        <span className="shrink-0">
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </span>
        <span
          className={`font-semibold text-xs w-10 shrink-0 ${
            req.method === 'GET'
              ? 'text-zinc-600'
              : req.method === 'POST'
                ? 'text-emerald-600'
                : req.method === 'DELETE'
                  ? 'text-red-600'
                  : 'text-zinc-500'
          }`}
        >
          {req.method}
        </span>
        <span className="flex-1 truncate text-sm text-zinc-700 font-mono">{req.url}</span>
        {req.status && (
          <span
            className={`text-xs font-medium w-10 text-right shrink-0 ${
              req.status >= 400 ? 'text-red-600' : req.status >= 300 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {req.status}
          </span>
        )}
        {req.durationMs && (
          <span className="text-xs text-zinc-400 w-14 text-right shrink-0">{req.durationMs}ms</span>
        )}
      </button>

      <AnimatePresence>
        {expanded && subTabs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pr-1 pb-3">
              <div className="flex gap-0.5 mb-2 border-b border-zinc-800">
                {subTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubTab(tab.id);
                    }}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-t transition-colors ${
                      subTab === tab.id
                        ? 'text-zinc-100 bg-zinc-800 border-b-2 border-zinc-500'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {subTab === 'request-headers' && (
                <div className="space-y-1.5">
                  {hasRequestHeaders && (
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Request</span>
                      <pre className="text-xs mt-0.5 bg-zinc-950 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto text-zinc-300">
                        {Object.entries(req.requestHeaders!).map(([k, v]) => `${k}: ${v}`).join('\n')}
                      </pre>
                    </div>
                  )}
                  {hasResponseHeaders && (
                    <div className="mt-1.5">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Response</span>
                      <pre className="text-xs mt-0.5 bg-zinc-950 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto text-zinc-300">
                        {Object.entries(req.responseHeaders!).map(([k, v]) => `${k}: ${v}`).join('\n')}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {subTab === 'request-payload' && hasRequestPayload && (
                <pre className="text-xs bg-zinc-950 p-2 rounded overflow-x-auto max-h-64 overflow-y-auto font-mono text-zinc-300">
                  {formatPayload(req.requestPayload!)}
                </pre>
              )}
              {subTab === 'response-payload' && hasResponsePayload && (
                <pre className="text-xs bg-zinc-950 p-2 rounded overflow-x-auto max-h-64 overflow-y-auto font-mono text-zinc-300">
                  {formatPayload(req.responsePayload!)}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────── ConsoleLogRow ─────────────────────── */

const ConsoleLogRow: React.FC<{ log: import('@/types/telemetry').ConsoleLogEntry }> = ({ log }) => (
  <div className="flex gap-2.5 text-sm py-1.5 font-mono">
    <span className="text-xs text-zinc-600 whitespace-nowrap shrink-0">
      {new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}
    </span>
    <span
      className={`font-semibold uppercase w-10 shrink-0 text-xs ${
        log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
      }`}
    >
      {log.level}
    </span>
    <span className="break-all text-zinc-300">{log.message}</span>
  </div>
);

/* ─────────────────────── Tab definitions ───────────────────── */

interface TabDef {
  id: RightTabId;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

/* ─────────────────────── RecordingDetailSkeleton ───────────── */

export const RecordingDetailSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header Skeleton */}
      <header className="flex-none px-8 pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 mt-0.5 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

          {/* Main Split Pane Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/30">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-6 max-w-3xl">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>

              {/* Video Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
                <Skeleton className="aspect-video w-full rounded-lg" />
              </div>

              {/* Steps Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-28 rounded-md" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-4 px-4">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-200 shrink-0" />

        {/* Right Pane */}
        <div className="w-[480px] flex shrink-0 bg-white">
          {/* Vertical Tab Strip */}
          <div className="w-14 border-r border-zinc-200 flex flex-col items-center py-3 gap-1 shrink-0 bg-zinc-50/50">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <div className="flex-1 p-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar Skeleton */}
      <div className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
    </div>
  );
};

/* ─────────────────────── RecordingDetailPage ───────────────── */

interface RecordingDetailProps {
  blueprint: TestBlueprint;
}

export const RecordingDetailPage: React.FC<RecordingDetailProps> = ({ blueprint }) => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(true);
  const [activeTab, setActiveTab] = useState<RightTabId>('steps');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const telemetry = blueprint.telemetry;
  const hasTelemetry = !!telemetry;

  const handleRunTest = () => {
    // Playback functionality requires a test runner
    // This would need to be implemented via a backend service
    toast.info('Playback feature requires a test runner service');
  };

  const handleCopyVideoLink = () => {
    if (blueprint.video_url) {
      navigator.clipboard.writeText(blueprint.video_url);
      toast.success('Video link copied to clipboard');
    } else {
      toast.error('No video available for this recording');
    }
  };

  const handleExportLLM = () => {
    if (!telemetry) {
      toast.error('No telemetry data available for export');
      return;
    }
    const transcript = generateLLMTranscript(
      telemetry,
      blueprint.steps.map((s) => ({
        action: s.action,
        description: s.description,
        value: s.value,
        selector: s.selector,
      }))
    );
    navigator.clipboard.writeText(transcript);
    toast.success('LLM transcript copied to clipboard');
  };

  const tabs: TabDef[] = [
    { id: 'steps', icon: <ListFilter className="w-[18px] h-[18px]" />, label: 'Steps', count: blueprint.steps.length },
    ...(hasTelemetry
      ? ([
          {
            id: 'console' as RightTabId,
            icon: <Terminal className="w-[18px] h-[18px]" />,
            label: 'Console',
            count: telemetry?.consoleLogs?.length,
          },
          {
            id: 'network' as RightTabId,
            icon: <Globe className="w-[18px] h-[18px]" />,
            label: 'Network',
            count: telemetry?.networkRequests?.length,
          },
          {
            id: 'errors' as RightTabId,
            icon: <Bug className="w-[18px] h-[18px]" />,
            label: 'Errors',
            count: telemetry?.jsErrors?.length,
          },
          {
            id: 'export' as RightTabId,
            icon: <FileCode className="w-[18px] h-[18px]" />,
            label: 'Export',
          },
        ] as TabDef[])
      : []),
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <header className="flex-none px-8 pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/recordings' })} className="h-9 w-9 shrink-0 mt-0.5">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 truncate">{blueprint.name}</h1>
              <p className="text-sm text-gray-500 mt-1.5">
                {blueprint.steps.length} steps · Manual Recording
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-sm rounded-md border-zinc-200"
              onClick={handleCopyVideoLink}
              disabled={!blueprint.video_url}
            >
              <Link className="w-4 h-4" />
              Copy Video Link
            </Button>
            <Button
              size="sm"
              className="gap-2 h-9 text-sm rounded-md bg-zinc-900 hover:bg-black text-white"
              onClick={handleRunTest}
            >
              <Play className="w-4 h-4 fill-current" />
              Run Live
            </Button>
          </div>
        </div>
      </header>

      {/* Main Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* ───── Left Pane: Video + Playhead Steps ───── */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/30">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-6 max-w-3xl">
              {/* Metadata */}
              <section className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {telemetry?.endTime
                    ? formatDuration(telemetry.endTime - telemetry.startTime)
                    : `${blueprint.steps.length} steps`}
                </span>
                <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {blueprint.projectDetails?.nameWithNamespace ||
                    blueprint.project_name ||
                    blueprint.project_id?.toString() ||
                    'Unassigned'}
                </span>
              </section>

              {/* Video */}
              {blueprint.video_url && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-zinc-500" />
                      Playback
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5 text-zinc-500 hover:text-zinc-700 rounded-md"
                      onClick={() => setShowVideo(!showVideo)}
                    >
                      {showVideo ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                  <AnimatePresence mode="wait">
                    {showVideo ? (
                      <motion.div
                        key="video"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-black"
                      >
                        <video src={blueprint.video_url} controls className="h-full w-full object-contain">
                          Your browser does not support the video tag.
                        </video>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => setShowVideo(true)}
                      >
                        <Video className="mb-1.5 h-6 w-6 opacity-30" />
                        <span className="text-sm font-medium">Click to show video</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </section>
              )}

              {/* Description */}
              {blueprint.description && (
                <p className="text-base text-zinc-600 leading-relaxed">{blueprint.description}</p>
              )}

              {/* Playhead Steps */}
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-4">
                  Test Steps
                </h2>
                <div className="space-y-0">
                  {blueprint.steps.map((step, index) => (
                    <PlayheadStep
                      key={index}
                      step={step}
                      index={index}
                      isLast={index === blueprint.steps.length - 1}
                      isActive={activeStepIndex === index}
                      onClick={() => setActiveStepIndex(index)}
                      stepContext={telemetry?.stepsWithContext?.find((c) => c.stepIndex === index)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-200 shrink-0" />

        {/* ───── Right Pane: Sidebar with Vertical Tabs ───── */}
        <div className="w-[480px] flex shrink-0 bg-white">
          {/* Vertical Tab Strip */}
          <div className="w-14 border-r border-zinc-200 flex flex-col items-center py-3 gap-1 shrink-0 bg-zinc-50/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`relative w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab.icon}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                      tab.id === 'errors' && tab.count > 0
                        ? 'bg-red-500 text-white'
                        : activeTab === tab.id
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-300 text-white'
                    }`}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tab header */}
            <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <span className="text-sm font-semibold text-zinc-700">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
              {activeTab === 'export' && (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 rounded-md bg-zinc-900 hover:bg-black text-white"
                  onClick={handleExportLLM}
                  disabled={!hasTelemetry}
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="p-5"
                >
                  {/* Steps Tab */}
                  {activeTab === 'steps' && (
                    <div className="space-y-4">
                      {blueprint.steps.map((step, index) => {
                        const ctx = telemetry?.stepsWithContext?.find((c) => c.stepIndex === index);
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border transition-colors ${
                              activeStepIndex === index
                                ? 'bg-zinc-50 border-zinc-300'
                                : 'bg-white border-zinc-100 hover:border-zinc-200'
                            }`}
                            onClick={() => setActiveStepIndex(index)}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-mono text-zinc-400 w-5">{index + 1}</span>
                              <span className="p-1 bg-zinc-100 rounded text-zinc-500">{getStepIcon(step.action)}</span>
                              <span className="text-sm font-semibold text-zinc-900 capitalize">{step.action}</span>
                              {step.value && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs py-0 font-normal bg-zinc-100 text-zinc-600 border-zinc-200"
                                >
                                  {step.value}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-zinc-600 mb-2 pl-7">{step.description}</p>
                            <div className="pl-7 space-y-1">
                              <code className="text-xs bg-zinc-50 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-100 block truncate font-mono">
                                {step.selector}
                              </code>
                              {step.xpath && (
                                <code className="text-xs bg-zinc-50 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-100 block truncate font-mono">
                                  {step.xpath}
                                </code>
                              )}
                            </div>
                            {ctx && (
                              <div className="pl-7 mt-2.5 flex flex-wrap gap-2">
                                {(ctx.surroundingErrors?.length || 0) > 0 && (
                                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    {ctx.surroundingErrors!.length} errors
                                  </span>
                                )}
                                {(ctx.surroundingRequests?.filter((r) => r.status && r.status >= 400).length || 0) >
                                  0 && (
                                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                    {ctx.surroundingRequests!.filter((r) => r.status && r.status >= 400).length} failed
                                  </span>
                                )}
                                {ctx.domMutationCount > 0 && (
                                  <span className="text-xs font-medium text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded">
                                    {ctx.domMutationCount} mutations
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Console Tab — Dark */}
                  {activeTab === 'console' && telemetry && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
                      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                          Console
                        </span>
                      </div>
                      <div className="p-4 max-h-[600px] overflow-y-auto">
                        {(telemetry.consoleLogs || []).length === 0 ? (
                          <p className="text-sm text-zinc-600 italic">No console logs captured.</p>
                        ) : (
                          <div className="space-y-0">
                            {(telemetry.consoleLogs || []).map((log, i) => (
                              <ConsoleLogRow key={i} log={log} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Network Tab */}
                  {activeTab === 'network' && telemetry && (
                    <div className="space-y-0">
                      {(telemetry.networkRequests || []).length === 0 ? (
                        <p className="text-base text-zinc-400 italic py-4">No network requests captured.</p>
                      ) : (
                        <div className="divide-y divide-zinc-100">
                          {(telemetry.networkRequests || []).map((req, i) => (
                            <ExpandableNetworkRow key={i} req={req} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Errors Tab — Dark */}
                  {activeTab === 'errors' && telemetry && (
                    <div className="space-y-4">
                      {(telemetry.jsErrors || []).length === 0 ? (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                          <p className="text-sm text-zinc-600 italic">No JavaScript errors captured.</p>
                        </div>
                      ) : (
                        (telemetry.jsErrors || []).map((err, i) => (
                          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-mono text-zinc-500">
                                {new Date(err.timestamp).toISOString().split('T')[1].slice(0, -1)}
                              </span>
                            </div>
                            <p className="text-base text-red-400 font-medium">{err.message}</p>
                            {err.source && (
                              <p className="text-sm text-zinc-500 mt-1.5">
                                {err.source}:{err.line}:{err.column}
                              </p>
                            )}
                            {err.stack && (
                              <pre className="text-xs text-zinc-500 mt-3 overflow-x-auto bg-zinc-950 p-3 rounded border border-zinc-800">
                                {err.stack}
                              </pre>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Export Tab — Dark */}
                  {activeTab === 'export' && telemetry && (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        Markdown transcript optimized for ChatGPT, Claude, or other LLMs. Includes step-by-step
                        context with console logs, network requests, and errors.
                      </p>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Preview
                          </span>
                          <span className="text-sm text-zinc-600">{generateLLMTranscript.length} chars</span>
                        </div>
                        <pre className="p-4 text-xs text-zinc-300 whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto leading-relaxed">
                          {generateLLMTranscript(
                            telemetry,
                            blueprint.steps.map((s) => ({
                              action: s.action,
                              description: s.description,
                              value: s.value,
                              selector: s.selector,
                            }))
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            Step {activeStepIndex + 1} of {blueprint.steps.length}
          </span>
          {hasTelemetry && (
            <>
              <span className="text-sm text-zinc-400">·</span>
              <span className="text-sm text-zinc-500">
                {telemetry?.consoleLogs?.length || 0} logs
              </span>
              <span className="text-sm text-zinc-400">·</span>
              <span className="text-sm text-zinc-500">
                {telemetry?.networkRequests?.length || 0} requests
              </span>
              {(telemetry?.jsErrors?.length || 0) > 0 && (
                <>
                  <span className="text-sm text-zinc-400">·</span>
                  <span className="text-sm text-red-600 font-medium">
                    {telemetry?.jsErrors?.length} errors
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-sm gap-1.5 text-zinc-500 hover:text-zinc-900 rounded-md"
          onClick={handleExportLLM}
          disabled={!hasTelemetry}
        >
          <FileCode className="w-3.5 h-3.5" />
          Export LLM
        </Button>
      </div>
    </div>
  );
};
