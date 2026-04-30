import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Edit3,
  Eye,
  Save,
  X,
  Loader2,
  FileText,
  FileCode,
  FileImage,
  FileType,
  Copy,
  Check,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';

interface DocumentViewerProps {
  content: string | null;
  filePath: string | null;
  loading?: boolean;
  onSave?: (content: string) => Promise<void>;
  saving?: boolean;
  className?: string;
}

function getFileTypeIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md':
    case 'markdown':
      return <FileType className="h-4 w-4 text-slate-500" />;
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'json':
    case 'yaml':
    case 'yml':
      return <FileCode className="h-4 w-4 text-stone-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="h-4 w-4 text-zinc-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
        'hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed',
        active && 'bg-muted text-foreground'
      )}
    >
      {icon}
    </button>
  );
}

function MarkdownToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/40 bg-muted/10">
      <ToolbarButton
        icon={<Bold className="h-3.5 w-3.5" />}
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={<Italic className="h-3.5 w-3.5" />}
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={<Strikethrough className="h-3.5 w-3.5" />}
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        icon={<Code className="h-3.5 w-3.5" />}
        label="Code"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <div className="w-px h-5 bg-border/40 mx-1" />

      <ToolbarButton
        icon={<Heading1 className="h-3.5 w-3.5" />}
        label="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        icon={<Heading2 className="h-3.5 w-3.5" />}
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        icon={<Heading3 className="h-3.5 w-3.5" />}
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <div className="w-px h-5 bg-border/40 mx-1" />

      <ToolbarButton
        icon={<List className="h-3.5 w-3.5" />}
        label="Bullet List"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={<ListOrdered className="h-3.5 w-3.5" />}
        label="Ordered List"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={<Quote className="h-3.5 w-3.5" />}
        label="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <div className="w-px h-5 bg-border/40 mx-1" />

      <ToolbarButton
        icon={<Undo className="h-3.5 w-3.5" />}
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={<Redo className="h-3.5 w-3.5" />}
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

export function DocumentViewer({
  content,
  filePath,
  loading,
  onSave,
  saving,
  className,
}: DocumentViewerProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editContent, setEditContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMarkdown = filePath?.match(/\.(md|markdown)$/i);

  // TipTap editor for markdown files
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage as any).markdown.getMarkdown();
      setEditContent(markdown);
      setDirty(true);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full px-8 py-6',
      },
    },
  });

  useEffect(() => {
    setMode('view');
    setEditContent(content || '');
    setDirty(false);
    // Update editor content when switching files
    if (editor && content !== undefined) {
      editor.commands.setContent(content || '');
    }
  }, [filePath, content, editor]);

  const handleEdit = useCallback(() => {
    setEditContent(content || '');
    setMode('edit');
    setDirty(false);
    // Set editor content when entering edit mode
    if (editor) {
      editor.commands.setContent(content || '');
      setTimeout(() => editor.commands.focus(), 100);
    }
  }, [content, editor]);

  const handleCancel = useCallback(() => {
    if (dirty && !confirm('You have unsaved changes. Discard?')) return;
    setMode('view');
    setEditContent(content || '');
    setDirty(false);
  }, [content, dirty]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    try {
      await onSave(editContent);
      setMode('view');
      setDirty(false);
      toast.success('Saved successfully');
    } catch {
      toast.error('Failed to save');
    }
  }, [editContent, onSave]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // Empty state
  if (!filePath) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
            <FileText className="h-7 w-7 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground/60">No file selected</p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Choose a file from the tree to view its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {getFileTypeIcon(filePath)}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold text-foreground/90 truncate">
              {fileName}
            </span>
            {dirty && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 dark:bg-stone-950/30 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-pulse" />
                Modified
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {mode === 'view' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              {isMarkdown && onSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-7 px-2.5 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 px-2.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="h-7 px-3 text-xs"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'view' ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {isMarkdown ? (
                <div className="p-8 max-w-3xl mx-auto">
                  <MarkdownRenderer content={content || ''} />
                </div>
              ) : (
                <div className="p-6">
                  <pre className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words bg-muted/30 rounded-xl p-5 border border-border/30">
                    {content || ''}
                  </pre>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              {isMarkdown ? (
                <>
                  <MarkdownToolbar editor={editor} />
                  <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full">
                    <style>{`
                      .tiptap-editor h1 {
                        scroll-margin-top: 2rem;
                        font-size: 1.5rem;
                        font-weight: 800;
                        letter-spacing: -0.025em;
                        margin-bottom: 1.5rem;
                        line-height: 1.2;
                      }
                      .tiptap-editor h2 {
                        scroll-margin-top: 2rem;
                        border-bottom: 1px solid hsl(var(--border));
                        padding-bottom: 0.5rem;
                        font-size: 1.25rem;
                        font-weight: 600;
                        letter-spacing: -0.025em;
                        margin-top: 2.5rem;
                        margin-bottom: 1rem;
                        line-height: 1.3;
                      }
                      .tiptap-editor h3 {
                        scroll-margin-top: 2rem;
                        font-size: 1.25rem;
                        font-weight: 600;
                        letter-spacing: -0.025em;
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        line-height: 1.3;
                      }
                      .tiptap-editor h4 {
                        scroll-margin-top: 2rem;
                        font-size: 1rem;
                        font-weight: 600;
                        letter-spacing: -0.025em;
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                        line-height: 1.4;
                      }
                      .tiptap-editor p {
                        line-height: 1.75;
                        margin-top: 1.5rem;
                      }
                      .tiptap-editor p:first-child {
                        margin-top: 0;
                      }
                      .tiptap-editor a {
                        font-weight: 500;
                        text-decoration: underline;
                        text-underline-offset: 4px;
                        color: hsl(var(--primary));
                        transition: color 0.15s;
                      }
                      .tiptap-editor a:hover {
                        color: hsl(var(--primary) / 0.8);
                      }
                      .tiptap-editor ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                        margin-top: 1.5rem;
                      }
                      .tiptap-editor ol {
                        list-style-type: decimal;
                        padding-left: 1.5rem;
                        margin-top: 1.5rem;
                        margin-bottom: 1.5rem;
                      }
                      .tiptap-editor li {
                        line-height: 1.75;
                        margin-top: 0.5rem;
                      }
                      .tiptap-editor blockquote {
                        margin-top: 1.5rem;
                        border-left: 2px solid hsl(var(--primary) / 0.3);
                        padding-left: 1.5rem;
                        font-style: italic;
                        color: hsl(var(--muted-foreground));
                      }
                      .tiptap-editor img {
                        border-radius: 0.375rem;
                        border: 1px solid hsl(var(--border));
                        margin: 1.5rem 0;
                        max-width: 100%;
                        height: auto;
                      }
                      .tiptap-editor hr {
                        margin: 2rem 0;
                        border-color: hsl(var(--border));
                      }
                      .tiptap-editor pre {
                        margin-bottom: 1rem;
                        margin-top: 1.5rem;
                        overflow-x: auto;
                        border-radius: 0.5rem;
                        border: 1px solid hsl(var(--border));
                        background-color: hsl(var(--muted));
                        padding: 1rem;
                      }
                      .tiptap-editor code {
                        position: relative;
                        border-radius: 0.25rem;
                        background-color: hsl(var(--muted) / 0.5);
                        padding: 0.3rem 0.3rem 0.2rem;
                        font-family: monospace;
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: hsl(var(--foreground));
                      }
                      .tiptap-editor pre code {
                        background-color: transparent;
                        padding: 0;
                        font-weight: 400;
                      }
                    `}</style>
                    <EditorContent editor={editor} className="tiptap-editor min-h-full" />
                  </div>
                </>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    setDirty(true);
                  }}
                  className="w-full h-full p-6 font-mono text-[13px] leading-relaxed resize-none border-0 focus:outline-none bg-background"
                  spellCheck={false}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
