import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PinNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
  issueTitle: string;
  portalContainer?: Element | null;
}

export const PinNoteModal: React.FC<PinNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote = '',
  issueTitle,
}) => {
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000000]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[1000001] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden pointer-events-auto mx-4"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-zinc-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Issue Note
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Add a personal reminder
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                    Issue
                  </p>
                  <p className="text-sm text-foreground font-medium truncate">
                    {issueTitle}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Your Note
                  </label>
                  <textarea
                    autoFocus
                    value={note}
                    onChange={e => setNote(e.target.value.slice(0, 200))}
                    placeholder="Enter your personal note here..."
                    className="w-full h-32 p-4 bg-muted border border-border rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        note.length >= 200 ? 'text-red-500' : 'text-muted-foreground'
                      )}
                    >
                      {note.length} / 200
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-zinc-600 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
