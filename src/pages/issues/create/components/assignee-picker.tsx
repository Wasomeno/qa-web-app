import React, { useState } from 'react';
import { Loader2, User as UserIcon, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AssigneePickerProps {
  members: any[];
  isLoading: boolean;
  selectedAssignee: any | null;
  onSelect: (member: any) => void;
  disabled: boolean;
  portalContainer?: HTMLElement | null;
}

export const AssigneePicker: React.FC<AssigneePickerProps> = ({
  members,
  isLoading,
  selectedAssignee,
  onSelect,
  disabled,
  portalContainer,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredMembers =
    members.filter(
      m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.username.toLowerCase().includes(query.toLowerCase())
    ) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal bg-background border-theme-border rounded-xl focus:ring-ring focus:border-ring hover:bg-accent transition-all"
          disabled={disabled}
        >
          <div className="flex items-center truncate">
            {selectedAssignee ? (
              <>
                <img
                  src={selectedAssignee.avatar_url}
                  alt={selectedAssignee.name}
                  className="w-5 h-5 rounded-full mr-2"
                />
                <span className="truncate">{selectedAssignee.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start" container={portalContainer}>
        <div className="p-2 border-b border-border">
          <input
            className="w-full bg-transparent border border-border rounded-md px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-1">
              <div
                className={cn(
                  'flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent',
                  !selectedAssignee && 'bg-muted text-foreground'
                )}
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
              >
                <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                Unassigned
                {!selectedAssignee && (
                  <Check className="w-4 h-4 ml-auto text-muted-foreground" />
                )}
              </div>
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className={cn(
                    'flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent',
                    selectedAssignee?.id === member.id &&
                      'bg-muted text-foreground'
                  )}
                  onClick={() => {
                    onSelect(member);
                    setOpen(false);
                  }}
                >
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {member.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      @{member.username}
                    </span>
                  </div>
                  {selectedAssignee?.id === member.id && (
                    <Check className="w-4 h-4 ml-auto text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
