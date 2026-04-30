import React from 'react';
import { cn } from '@/lib/utils';
import { IssueFilterState } from '@/types/issues';
import {
  User,
  PenTool,
  AlertCircle,
  PlayCircle,
  Ban,
  GitMerge,
  HelpCircle,
} from 'lucide-react';

interface QuickFilterChipsProps {
  filters: IssueFilterState['quickFilters'];
  onToggle: (key: keyof IssueFilterState['quickFilters']) => void;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  filters,
  onToggle,
}) => {
  const chips = [
    { key: 'assignedToMe' as const, label: 'Assigned to Me', icon: User },
    { key: 'createdByMe' as const, label: 'Created by Me', icon: PenTool },
    { key: 'highPriority' as const, label: 'High Priority', icon: AlertCircle },
    { key: 'inQa' as const, label: 'In QA', icon: PlayCircle },
    { key: 'blocked' as const, label: 'Blocked', icon: Ban },
    { key: 'hasOpenMr' as const, label: 'Has Open MR', icon: GitMerge },
    { key: 'unassigned' as const, label: 'Unassigned', icon: HelpCircle },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar mask-gradient-right">
      {chips.map(chip => {
        const isActive = filters[chip.key];
        const Icon = chip.icon;

        return (
          <button
            key={chip.key}
            onClick={() => onToggle(chip.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap border',
              isActive
                ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                : 'bg-white/60 text-gray-600 border-gray-200/80 hover:bg-white hover:border-gray-300 hover:shadow-sm'
            )}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                isActive ? 'text-primary-500' : 'text-gray-400'
              )}
            />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};
