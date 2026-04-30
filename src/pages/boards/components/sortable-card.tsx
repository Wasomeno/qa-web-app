import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardCard } from './board-card';
import { BoardIssue } from '../mock-data';

interface SortableCardProps {
  issue: BoardIssue;
  onPin?: (issue: BoardIssue) => void;
  onClick?: (issue: BoardIssue) => void;
  density?: 'comfortable' | 'compact';
}

export const SortableCard: React.FC<SortableCardProps> = ({
  issue,
  onPin,
  onClick,
  density,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id, data: { type: 'Issue', issue } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? '1.02' : '1',
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'shadow-xl' : ''}
    >
      <BoardCard issue={issue} onPin={onPin} onClick={onClick} density={density} />
    </div>
  );
};
