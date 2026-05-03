import React from 'react';
import { cn } from '@/lib/utils';
import { BoardIssue } from '../mock-data';
import { Pin, ExternalLink, Link2 } from 'lucide-react';

interface BoardCardProps {
  issue: BoardIssue;
  onPin?: (issue: BoardIssue) => void;
  onClick?: (issue: BoardIssue) => void;
  density?: 'comfortable' | 'compact';
}

/** Convert hex to rgba for sleek muted label chips */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  issue,
  onPin,
  onClick,
  density = 'comfortable',
}) => {
  const isCompact = density === 'compact';

  return (
    <div
      onClick={() => onClick?.(issue)}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        'hover:shadow-md hover:border-gray-200',
        'transition-all duration-200 cursor-pointer group relative overflow-hidden',
        isCompact ? 'p-2.5' : 'p-3.5'
      )}
    >
      {/* Top accent line */}
      {issue.labels[0]?.color && (
        <div
          className="absolute left-0 right-0 top-0 h-[2px] opacity-60"
          style={{ backgroundColor: issue.labels[0].color }}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <h4
          className={cn(
            'text-sm font-medium text-gray-900 transition-colors line-clamp-2 leading-tight',
            isCompact && 'text-xs'
          )}
        >
          {issue.title}
        </h4>
      </div>

      <div
        className={cn(
          'flex items-center justify-between',
          isCompact ? 'mt-2' : 'mt-3'
        )}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-mono tabular-nums">
            #{issue.iid}
          </span>
          {issue.labels.slice(0, isCompact ? 2 : 3).map((label) => (
            <span
              key={label.id}
              className="px-1.5 py-0.5 rounded-md text-[10px] font-medium border"
              style={{
                backgroundColor: hexToRgba(label.color, 0.08),
                color: hexToRgba(label.color, 0.85),
                borderColor: hexToRgba(label.color, 0.15),
              }}
            >
              {label.name}
            </span>
          ))}
          {!isCompact && issue.weight !== undefined && issue.weight > 0 && (
            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
              {issue.weight}pt
            </span>
          )}
        </div>

        {issue.assignee && (
          <div className="flex-shrink-0" title={issue.assignee.name}>
            <img
              src={issue.assignee.avatarUrl}
              alt={issue.assignee.username}
              className="w-5 h-5 rounded-full border border-gray-100 ring-1 ring-gray-100"
            />
          </div>
        )}
      </div>

      {/* Action Overlay */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-gray-100/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin?.(issue);
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
          title="Pin Issue"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3 bg-gray-200 mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(issue.webUrl, '_blank');
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
          title="Open in GitLab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(issue.webUrl);
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
          title="Copy Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
