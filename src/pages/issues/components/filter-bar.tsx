import React, { useRef } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { IssueFilterState } from '@/types/issues';
import { Input } from '@/components/ui/input';
import { SearchablePicker } from './searchable-picker';
import { ProjectSelect } from '@/components/project-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Option {
  label: string;
  value: string | number;
}

interface IssueFilterBarProps {
  filters: IssueFilterState;
  onFilterChange: <K extends keyof IssueFilterState>(
    key: K,
    value: IssueFilterState[K]
  ) => void;
  labelOptions: Option[];
  portalContainer?: HTMLElement | null;
}

export const IssueFilterBar: React.FC<IssueFilterBarProps> = ({
  filters,
  onFilterChange,
  labelOptions,
  portalContainer,
}) => {
  const assigneeOptions: Option[] = [
    { label: 'Me', value: 'ME' },
    { label: 'Unassigned', value: 'None' },
  ];

  const prevProjectIdsRef = useRef<string[]>(filters.projectIds);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input Row — Command Bar Hero */}
      <div className="relative w-full">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10"
        />
        <Input
          type="text"
          aria-label="Search issues"
          placeholder="Search issues by title, ID, or description…"
          value={filters.search}
          onChange={e => onFilterChange('search', e.target.value)}
          className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-2xl text-base placeholder:text-gray-400 focus:ring-2 focus:ring-zinc-500/15 focus:border-zinc-500 transition-all shadow-sm"
        />
      </div>

      {/* Filters Grid Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Project Filter */}
        <ProjectSelect
          value={filters.projectIds}
          onSelect={() => {}}
          onSelectMultiple={projects => {
            const newIds = projects.map(p => p.id.toString());
            onFilterChange('projectIds', newIds);
            prevProjectIdsRef.current = newIds;
          }}
          mode="multi"
          portalContainer={portalContainer ?? null}
          placeholder="All Projects"
        />

        {/* Assignee Filter */}
        <SearchablePicker
          multiple
          options={assigneeOptions}
          value={filters.assigneeIds || ['ALL']}
          onSelect={val => onFilterChange('assigneeIds', val as (string | number)[])}
          placeholder="All Assignees"
          searchPlaceholder="Search assignees…"
          allOption={{ label: 'All Assignees', value: 'ALL' }}
          portalContainer={portalContainer}
          className="w-full"
        />

        {/* Label Filter */}
        <SearchablePicker
          multiple
          options={labelOptions}
          value={filters.labels || ['ALL']}
          onSelect={val =>
            onFilterChange('labels', val as string[])
          }
          placeholder="All Labels"
          searchPlaceholder="Search labels…"
          allOption={{ label: 'All Labels', value: 'ALL' }}
          portalContainer={portalContainer}
          className="w-full"
        />

        {/* Sort Filter */}
        <Select
          value={filters.sort}
          onValueChange={val =>
            onFilterChange('sort', val as IssueFilterState['sort'])
          }
        >
          <SelectTrigger className="bg-white border-theme-border rounded-xl text-theme-text focus:ring-zinc-500/20 focus:border-zinc-500 w-full h-10">
            <div className="flex items-center gap-2">
              <ArrowUpDown
                aria-hidden="true"
                className="w-3.5 h-3.5 text-gray-400"
              />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent container={portalContainer}>
            <SelectItem value="UPDATED">Recently Updated</SelectItem>
            <SelectItem value="NEWEST">Newest Created</SelectItem>
            <SelectItem value="OLDEST">Oldest Created</SelectItem>
            <SelectItem value="PRIORITY">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
