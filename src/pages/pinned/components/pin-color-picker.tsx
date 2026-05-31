import React from 'react';
import { PinColor } from '@/types/issues';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const PIN_COLORS: { id: PinColor; color: string; label: string }[] = [
  { id: 'default', color: '#9CA3AF', label: 'Default' },
  { id: 'red', color: '#EF4444', label: 'High Priority' },
  { id: 'orange', color: '#F97316', label: 'Urgent' },
  { id: 'yellow', color: '#EAB308', label: 'Important' },
  { id: 'green', color: '#22C55E', label: 'In Progress' },
  { id: 'blue', color: '#3B82F6', label: 'Waiting' },
  { id: 'purple', color: '#8B5CF6', label: 'Review' },
];

interface PinColorPickerProps {
  currentColor?: PinColor;
  onSelect: (color: PinColor) => void;
  onClose: () => void;
}

export const PinColorPicker: React.FC<PinColorPickerProps> = ({
  currentColor = 'default',
  onSelect,
  onClose,
}) => {
  return (
    <div className="bg-background rounded-xl shadow-xl border border-border p-3 min-w-[180px]">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pin Color
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PIN_COLORS.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center',
              currentColor === item.id
                ? 'border-foreground scale-110'
                : 'border-transparent hover:scale-105'
            )}
            title={item.label}
          >
            <div
              className="w-5 h-5 rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
          </button>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-border italic">
        <p className="text-[10px] text-muted-foreground text-center">
          Colors help you group your pinned issues
        </p>
      </div>
    </div>
  );
};
