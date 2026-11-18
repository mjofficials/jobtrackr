import { Badge } from '@/components/ui/badge';
import { statusMeta } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

/** Stage pill: tinted background + glowing dot in the stage colour. */
export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const s = statusMeta(status);
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border-transparent font-medium', s.text, className)}
      style={{ backgroundColor: `${s.hex}1A` }}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.color)} style={{ boxShadow: `0 0 8px ${s.hex}` }} aria-hidden />
      {s.label}
    </Badge>
  );
}
