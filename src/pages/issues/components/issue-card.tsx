import React from 'react';
import {
  Pin,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  Palette,
  MessageSquare,
  Link2,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { PinColor, PinnedIssueMeta } from '@/types/issues';
import { Issue } from '@/api/issue';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Map for pin colors
const PIN_COLOR_MAP: Record<PinColor, string> = {
  default: 'bg-gray-400',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

/** Convert hex to rgba for sleek muted label chips */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extended Issue type to support pinning metadata
 */
type IssueWithPin = Issue & { pinnedMeta?: PinnedIssueMeta };

/**
 * Base Props for the visual representation of an issue card
 */
interface BaseIssueCardProps {
  issue: IssueWithPin;
  onClick: (issue: IssueWithPin) => void;
  actions?: React.ReactNode;
  showPinnedStyles?: boolean;
  className?: string;
}

/**
 * BaseIssueCard component that handles the layout and visual content
 */
export const BaseIssueCard: React.FC<BaseIssueCardProps> = ({
  issue,
  onClick,
  actions,
  showPinnedStyles = false,
  className = '',
}) => {
  const assignee = issue.assignees?.[0];
  const author = issue.author;
  const hasChildIssues = issue.child && issue.child.amount > 0;

  return (
    <div
      onClick={() => onClick(issue)}
      className={cn(
        'group relative p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 hover:scale-[1.003] transition-all duration-200 cursor-pointer overflow-hidden w-full',
        className
      )}
    >
      {/* Dynamic Pin Color Bar */}
      {showPinnedStyles && issue.pinnedMeta && (
        <div
          className={cn(
            'absolute left-0 top-3 bottom-3 w-[3px] rounded-full',
            PIN_COLOR_MAP[issue.pinnedMeta.pinColor]
          )}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono tabular-nums text-gray-400">
              #{issue.iid}
            </span>
            <h4 className="text-sm font-medium text-gray-900 truncate pr-6 leading-snug">
              {issue.title}
            </h4>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {issue.project_name && (
              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                {issue.project_name}
              </span>
            )}

            {issue.label_details && issue.label_details.length > 0
              ? issue.label_details.slice(0, 3).map(label => (
                  <span
                    key={label.id}
                    className="text-[11px] px-2 py-0.5 rounded-md border font-medium"
                    style={{
                      backgroundColor: hexToRgba(label.color, 0.08),
                      color: hexToRgba(label.color, 0.85),
                      borderColor: hexToRgba(label.color, 0.15),
                    }}
                  >
                    {label.name}
                  </span>
                ))
              : issue.labels?.slice(0, 3).map((label, index) => (
                  <span
                    key={index}
                    className="text-[11px] px-2 py-0.5 rounded-md border bg-gray-50 border-gray-200 text-gray-600 font-medium"
                  >
                    {label}
                  </span>
                ))}

            {hasChildIssues && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium',
                  'bg-blue-50 text-blue-700 border border-blue-100'
                )}
              >
                <ClipboardList className="w-3 h-3" />
                {issue.child!.amount}
              </span>
            )}

            {(issue.merge_requests_count ?? 0) > 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium',
                  'bg-green-50 text-green-700 border border-green-100'
                )}
              >
                <GitPullRequest className="w-3 h-3" />
                {issue.merge_requests_count}
              </span>
            )}
          </div>

          {/* Author info */}
          {author && (
            <div className="flex items-center gap-1.5 mt-3">
              <img
                src={author.avatar_url}
                alt={author.name}
                title={`Opened by ${author.name}`}
                className="w-5 h-5 rounded-full border border-gray-100 ring-1 ring-gray-100"
              />
              <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                {author.name}
              </span>
            </div>
          )}
        </div>

        {/* Right Content / Assignee */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {assignee ? (
            <img
              src={assignee.avatar_url}
              alt={assignee.name}
              title={`Assigned to ${assignee.name}`}
              className="w-7 h-7 rounded-full border border-gray-100 ring-1 ring-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-white">
              <span className="text-[10px] text-gray-400">?</span>
            </div>
          )}
          <span className="text-[11px] text-gray-400 whitespace-nowrap tabular-nums">
            {formatDistanceToNow(new Date(issue.updated_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Note view */}
      {showPinnedStyles && issue.pinnedMeta?.note && (
        <div className="mt-3 flex gap-2 items-start bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 italic line-clamp-2 leading-relaxed">
            {issue.pinnedMeta.note}
          </p>
        </div>
      )}

      {/* Action Overlay */}
      {actions && (
        <div className="absolute right-3 top-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-gray-100/80">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * HOC Props
 */
interface IssueCardProps {
  issue: IssueWithPin;
  onClick: (issue: IssueWithPin) => void;
  // Dynamic props that might come from the HOC or user
  onPin?: (issue: IssueWithPin) => void;
  onUnpin?: (issue: IssueWithPin) => void;
  onSetPinColor?: (issue: IssueWithPin) => void;
  onAddNote?: (issue: IssueWithPin) => void;
  onFixIssue?: (issue: IssueWithPin) => void;
  variant?: 'default' | 'pinned';
  className?: string;
}

/**
 * High-Order Component to customize Issue Actions
 */
const withIssueActions = (variant: 'default' | 'pinned') => {
  return (props: IssueCardProps) => {
    const { issue, onPin, onUnpin, onSetPinColor, onAddNote, onFixIssue, className } = props;
    const isPinned = variant === 'pinned';

    const handleOpenGitlab = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(issue.web_url, '_blank');
    };

    const handlePinToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPinned) onUnpin?.(issue);
      else onPin?.(issue);
    };

    // Construct actions based on variant
    const actions = (
      <>
        {isPinned ? (
          <>
            <button
              onClick={handlePinToggle}
              className="p-1 hover:bg-amber-100 rounded text-amber-500 transition-colors"
              title="Unpin Issue"
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onSetPinColor?.(issue);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              title="Set Pin Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onAddNote?.(issue);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              title="Add/Edit Note"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={handlePinToggle}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
            title="Pin Issue"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="w-px h-3 bg-gray-200 mx-0.5" />
        <button
          onClick={handleOpenGitlab}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
          title="Open in GitLab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard.writeText(issue.web_url);
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
          title="Copy Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3 bg-gray-200 mx-0.5" />
        <button
          onClick={e => {
            e.stopPropagation();
            onFixIssue?.(issue);
          }}
          className="p-1 hover:bg-purple-100 rounded text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fix with Agent"
          disabled={issue.state === 'closed'}
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </>
    );

    return (
      <BaseIssueCard {...props} showPinnedStyles={isPinned} actions={actions} className={className} />
    );
  };
};

/**
 * Specialized Exports
 */
export const DefaultIssueCard = withIssueActions('default');
export const PinnedIssueCard = withIssueActions('pinned');

/**
 * Main IssueCard component that maintains backward compatibility
 * but uses the HOC-refactored architecture under the hood.
 */
export const IssueCard: React.FC<IssueCardProps> = props => {
  const { className, ...rest } = props;
  const Component =
    rest.variant === 'pinned' ? PinnedIssueCard : DefaultIssueCard;
  return <Component {...rest} className={className} />;
};
