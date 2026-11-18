import { Badge } from '@/components/ui/badge';
import { statusMeta, stageGlow, stageTint } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

/** Stage pill: tinted background + glowing dot in the stage colour. */
export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const s = statusMeta(status);
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border-transparent font-medium', s.text, className)}
      style={{ backgroundColor: stageTint(s, 0.1) }}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.color)} style={{ boxShadow: stageGlow(s, 8) }} aria-hidden />
      {s.label}
    </Badge>
  );
}
