import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, GitBranch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/utils/useDebounce';
import type { GitLabBranch } from '@/api/project';

interface BranchSelectProps {
  /** All branches (or search results) from the hook */
  branches: GitLabBranch[];
  value: string | null;
  onSelect: (branch: string) => void;
  /** Called when the search input changes (debounced) */
  onSearch?: (query: string) => void;
  loading?: boolean;
  className?: string;
  size?: 'default' | 'compact';
}

export function BranchSelect({
  branches,
  value,
  onSelect,
  onSearch,
  loading,
  className,
  size = 'default',
}: BranchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Fire the server-side search when debounced value changes
  useEffect(() => {
    if (open && onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, open, onSearch]);

  const selectedBranch = branches.find((b) => b.name === value);
  const defaultBranch = branches.find((b) => b.default);
  const displayBranch = selectedBranch?.name ?? defaultBranch?.name ?? value ?? 'Select branch';

  const isCompact = size === 'compact';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between gap-1 font-normal',
            isCompact ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            ) : (
              <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{displayBranch}</span>
          </span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search branches..."
            value={search}
            onValueChange={setSearch}
            className="h-8"
          />
          <CommandList>
            {loading && branches.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Searching…
              </div>
            ) : branches.length === 0 ? (
              <CommandEmpty>No branches found.</CommandEmpty>
            ) : null}
            <CommandGroup>
              {branches.map((branch) => (
                <CommandItem
                  key={branch.name}
                  value={branch.name}
                  onSelect={() => {
                    onSelect(branch.name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      value === branch.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <GitBranch className="h-3 w-3 mr-1.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{branch.name}</span>
                  {branch.default && (
                    <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      default
                    </span>
                  )}
                  {branch.protected && !branch.default && (
                    <span className="ml-auto text-[10px] text-muted-foreground/50">
                      🔒
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
