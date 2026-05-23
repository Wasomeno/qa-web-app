 import React from 'react';
 import { Folder, MoreVertical } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 
 interface FolderItemProps {
   name: string;
   count: number;
   isSelected?: boolean;
   onClick?: () => void;
   onDoubleClick?: () => void;
   viewMode?: 'grid' | 'list';
 }
 
 export const FolderItem: React.FC<FolderItemProps> = ({
   name,
   count,
   isSelected,
   onClick,
   onDoubleClick,
   viewMode = 'grid',
 }) => {
   if (viewMode === 'list') {
     return (
       <div
         className={cn(
           'flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b transition-colors',
           isSelected && 'bg-muted/50 hover:bg-muted/80'
         )}
         onClick={onClick}
         onDoubleClick={onDoubleClick}
       >
         <Folder className="w-5 h-5 text-muted-foreground fill-muted-foreground" />
         <span className="flex-1 font-medium text-foreground/80 truncate">{name}</span>
         <span className="text-xs text-muted-foreground w-24 text-right">{count} items</span>
         <Button variant="ghost" size="icon" className="h-8 w-8">
           <MoreVertical className="w-4 h-4" />
         </Button>
       </div>
     );
   }
 
   return (
     <div
       className={cn(
         'p-4 border rounded-xl flex items-center gap-3 hover:shadow-sm hover:border-border cursor-pointer transition-all bg-card group',
         isSelected ? 'border-foreground bg-muted/50 ring-1 ring-foreground' : 'border-border'
       )}
       onClick={onClick}
       onDoubleClick={onDoubleClick}
     >
       <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
         <Folder className="w-6 h-6 text-muted-foreground fill-muted-foreground group-hover:text-foreground group-hover:fill-foreground transition-colors" />
       </div>
       <div className="flex-1 min-w-0">
         <p className="font-semibold text-foreground truncate">{name}</p>
         <p className="text-xs text-muted-foreground">{count} recordings</p>
       </div>
       <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
         <MoreVertical className="w-4 h-4" />
       </Button>
     </div>
   );
 };
