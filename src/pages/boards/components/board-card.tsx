import React from 'react';
import { cn } from '@/lib/utils';
import { BoardIssue } from '../mock-data';
import { Pin, ExternalLink, Link2, Wrench } from 'lucide-react';

interface BoardCardProps {
  issue: BoardIssue;
  onPin?: (issue: BoardIssue) => void;
  onClick?: (issue: BoardIssue) => void;
  onFixIssue?: (issue: BoardIssue) => void;
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
  onFixIssue,
  density = 'comfortable',
}) => {
  const isCompact = density === 'compact';

  return (
    <div
      onClick={() => onClick?.(issue)}
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm',
        'hover:shadow-md hover:border-border',
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
            'text-sm font-medium text-foreground transition-colors line-clamp-2 leading-tight',
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
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
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
            <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-md border border-border">
              {issue.weight}pt
            </span>
          )}
        </div>

        {issue.assignee && (
          <div className="flex-shrink-0" title={issue.assignee.name}>
            <img
              src={issue.assignee.avatarUrl}
              alt={issue.assignee.username}
              className="w-5 h-5 rounded-full border border-border ring-1 ring-border"
            />
          </div>
        )}
      </div>

      {/* Action Overlay */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin?.(issue);
          }}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground/80 transition-colors"
          title="Pin Issue"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3 bg-border mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(issue.webUrl, '_blank');
          }}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground/80 transition-colors"
          title="Open in GitLab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(issue.webUrl);
          }}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground/80 transition-colors"
          title="Copy Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3 bg-border mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFixIssue?.(issue);
          }}
          className="p-1 hover:bg-purple-100 rounded text-muted-foreground hover:text-purple-600 transition-colors"
          title="Fix with Agent"
        >
          <Wrench className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
