import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentIndex = THEME_OPTIONS.findIndex((o) => o.value === (mounted ? theme : 'light'));
  const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
  const nextTheme = THEME_OPTIONS[nextIndex];
  const NextIcon = nextTheme.icon;

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground',
          className,
        )}
        title="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </div>
    );
  }

  const currentOption = THEME_OPTIONS[currentIndex];

  return (
    <button
      onClick={() => setTheme(nextTheme.value)}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'text-muted-foreground dark:text-muted-foreground',
        className,
      )}
      title={`Theme: ${currentOption.label}. Click for ${nextTheme.label}.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentOption.value}
          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <currentOption.icon className="h-4 w-4" />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
