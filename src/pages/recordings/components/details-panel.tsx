 import React from 'react';
 import { X, FileText, Clock, Calendar, Hash, FileCode, Play, Bot, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Separator } from '@/components/ui/separator';
 import { TestBlueprint } from '@/types/recording';
 import { Badge } from '@/components/ui/badge';
 
 interface DetailsPanelProps {
   recording: TestBlueprint | null;
   onClose: () => void;
   onRun: () => void;
   onRunInAgent: () => void;
   onDelete: () => void;
   onViewDetails: () => void;
 }
 
 export const DetailsPanel: React.FC<DetailsPanelProps> = ({
   recording,
   onClose,
   onRun,
   onRunInAgent,
   onDelete,
   onViewDetails,
 }) => {
   if (!recording) {
     return (
       <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-card">
         <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-border">
           <FileText className="w-8 h-8 opacity-20" />
         </div>
         <p className="font-semibold text-foreground">Select an item</p>
         <p className="text-xs mt-1 leading-relaxed max-w-[200px]">Select a recording or project folder to see more details.</p>
       </div>
     );
   }
 
   return (
     <div className="h-full flex flex-col bg-card border-l">
       <div className="flex items-center justify-between px-4 py-3 border-b">
         <h3 className="font-semibold text-foreground truncate pr-2">Details</h3>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
           <X className="w-4 h-4" />
         </Button>
       </div>
 
       <ScrollArea className="flex-1">
         <div className="p-4 space-y-6">
           <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden border border-border border-dashed">
             <FileText className="w-12 h-12 text-muted-foreground/30 opacity-20" />
           </div>
 
           <div>
             <h2 className="text-lg font-bold text-foreground leading-tight">{recording.name}</h2>
             <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
               {recording.description || 'No description provided for this automation test.'}
             </p>
           </div>
 
           <div className="flex gap-2">
             <Button className="flex-1 gap-2 bg-zinc-900 hover:bg-black" size="sm" onClick={onRun}>
               <Play className="w-4 h-4 fill-current" /> Play
             </Button>
             <Button variant="outline" className="flex-1 gap-2 border-border hover:bg-muted/50" size="sm" onClick={onRunInAgent}>
               <Bot className="w-4 h-4" /> Agent
             </Button>
           </div>
 
           <Separator />
 
           <div className="space-y-4">
             <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Properties</h4>
             
             <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Hash className="w-4 h-4" /> ID
               </div>
               <div className="text-foreground font-mono text-[11px] truncate">{recording.id}</div>
 
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Clock className="w-4 h-4" /> Steps
               </div>
               <div className="text-foreground">{recording.steps.length} actions recorded</div>
 
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Calendar className="w-4 h-4" /> Created
               </div>
               <div className="text-foreground">
                 N/A
               </div>
 
               <div className="flex items-center gap-2 text-muted-foreground">
                 <FileCode className="w-4 h-4" /> Type
               </div>
               <div>
                 <Badge variant="secondary" className="bg-muted/50 text-foreground hover:bg-muted border-border font-normal">
                   Playwright
                 </Badge>
               </div>
             </div>
           </div>
 
           <Separator />
 
           <div className="space-y-3">
             <Button variant="ghost" className="w-full justify-start gap-3 text-foreground/80 hover:text-foreground hover:bg-muted/50" size="sm" onClick={onViewDetails}>
               View full details
             </Button>
             <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" size="sm" onClick={onDelete}>
               <Trash2 className="w-4 h-4" /> Delete recording
             </Button>
           </div>
         </div>
       </ScrollArea>
     </div>
   );
 };
