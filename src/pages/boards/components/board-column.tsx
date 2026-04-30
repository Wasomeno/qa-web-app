import React from 'react';
import { BoardColumn as IBoardColumn } from '../mock-data';

interface BoardColumnProps {
  column: IBoardColumn;
  children?: React.ReactNode;
  issueCount?: number;
  isDropTarget?: boolean;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  children,
  issueCount,
  isDropTarget = false,
}) => {
  const count = issueCount ?? column.issues.length;
  const color = column.color || '#9CA3AF';

  return (
    <div
      className="w-[280px] flex flex-col flex-1 max-h-full rounded-xl border border-gray-100 overflow-hidden relative transition-colors duration-200"
      style={{
        backgroundColor: isDropTarget ? `${color}08` : '#FAFAFA',
        borderColor: isDropTarget ? `${color}40` : undefined,
        boxShadow: isDropTarget ? `0 0 0 1px ${color}30, 0 4px 12px ${color}15` : undefined,
      }}
    >
      {/* Vertical lane accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      {/* Column Header */}
      <div className="px-3.5 py-3 flex items-center justify-between overflow-hidden relative">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {column.title}
          </h3>
          {color && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-gray-100 text-gray-600 shadow-sm tabular-nums flex-shrink-0">
          {count}
        </span>
      </div>

      {/* Header accent bar */}
      <div className="mx-3.5 h-[2px] rounded-full mb-2" style={{ backgroundColor: `${color}25` }} />

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto max-h-[60vh] px-2.5 pb-2.5 space-y-2 min-h-0 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};
