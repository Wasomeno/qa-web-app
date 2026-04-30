import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const IssueCardSkeleton: React.FC = () => {
  return (
    <div
      className={cn(
        'relative p-4 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {/* ID Skeleton */}
            <Skeleton className="h-3.5 w-8 rounded bg-gray-100" />
            {/* Title Skeleton */}
            <Skeleton className="h-4 w-3/4 rounded bg-gray-100" />
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {/* Project Name Skeleton */}
            <Skeleton className="h-5 w-16 rounded-md bg-gray-100" />

            {/* Labels Skeletons */}
            <Skeleton className="h-5 w-12 rounded-md bg-gray-100" />
            <Skeleton className="h-5 w-14 rounded-md bg-gray-100" />
          </div>
        </div>

        {/* Right Content / Assignee */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Avatar Skeleton */}
          <Skeleton className="w-7 h-7 rounded-full bg-gray-100" />
          {/* Time Skeleton */}
          <Skeleton className="h-3 w-12 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};
