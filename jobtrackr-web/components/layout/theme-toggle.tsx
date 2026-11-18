'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Flips between light and dark. The icon is picked by CSS (`dark:` classes),
 * not by JS, so server and client render the same markup — no hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-8 w-8 shrink-0', className)} onClick={() => setTheme(next)} aria-label="Toggle light and dark theme">
          <Sun className="h-4 w-4 dark:hidden" aria-hidden />
          <Moon className="hidden h-4 w-4 dark:block" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Switch to {next} theme</TooltipContent>
    </Tooltip>
  );
}
