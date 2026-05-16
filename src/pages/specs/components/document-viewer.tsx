import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Loader2,
  FileText,
  FileCode,
  FileImage,
  FileType,
  Copy,
  Check,
  Download,
} from 'lucide-react';

interface DocumentViewerProps {
  content: string | null;
  filePath: string | null;
  loading?: boolean;
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

export function DocumentViewer({
  content,
  filePath,
  loading,
  className,
}: DocumentViewerProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleDownload = useCallback(() => {
    if (!filePath || !content || downloading) return;
    setDownloading(true);
    try {
      const fileName = filePath.split('/').pop() || filePath;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('[DocumentViewer] Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [filePath, content, downloading]);

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
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5 border-b border-border/40 bg-muted/20 shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {getFileTypeIcon(filePath)}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold text-foreground/90 truncate">
              {fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
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
          {content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              title="Download file"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="h-full"
        >
          {filePath?.match(/\.(md|markdown)$/i) ? (
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
              <MarkdownRenderer content={content || ''} />
            </div>
          ) : (
            <div className="p-3 md:p-6">
              <pre className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words bg-muted/30 rounded-xl p-4 md:p-5 border border-border/30">
                {content || ''}
              </pre>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
