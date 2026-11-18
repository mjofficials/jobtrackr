'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { BellRing, ExternalLink, GripVertical, MoreHorizontal, Pencil } from 'lucide-react';
import { useMoveApplication } from '@/hooks/use-api';
import { STATUSES, statusMeta } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Application } from '@/types';

function salary(a: Application) {
  if (!a.salaryMin && !a.salaryMax) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: a.currency, notation: 'compact', maximumFractionDigits: 1 }).format(n);
  if (a.salaryMin && a.salaryMax) return `${fmt(a.salaryMin)} – ${fmt(a.salaryMax)}`;
  return fmt((a.salaryMin ?? a.salaryMax)!);
}

interface Props {
  app: Application;
  onOpen: () => void;
  /** Rendered inside the drag overlay: no drag handle wiring, lifted look. */
  overlay?: boolean;
}

export function ApplicationCard({ app, onOpen, overlay }: Props) {
  const move = useMoveApplication();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id, disabled: overlay });
  const pay = salary(app);
  const stage = statusMeta(app.status);
  const active = app.status !== 'REJECTED' && app.status !== 'OFFER';
  const followUpDue = active && app.followupDate && new Date(app.followupDate) <= new Date();

  const moveTo = (status: Application['status']) =>
    move.mutate({ id: app.id, status }, { onSuccess: () => toast(`${app.company} moved to ${statusMeta(status).label}`) });

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), ['--glow' as string]: `${stage.hex}55` }}
      className={cn(
        'group relative rounded-xl border bg-card p-3.5 transition-[border-color,box-shadow]',
        'hover:border-[color:var(--glow)] hover:shadow-glow',
        isDragging && 'opacity-30',
        overlay && 'rotate-2 cursor-grabbing border-[color:var(--glow)] shadow-glow'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          aria-label={`Drag ${app.company}`}
          className="-ml-1 mt-0.5 cursor-grab touch-none rounded text-muted-foreground/50 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>

        <button onClick={onOpen} className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h3 className="truncate font-sans font-semibold leading-snug tracking-normal">{app.company}</h3>
          <p className="truncate text-sm text-muted-foreground">{app.role}</p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-1.5 -mt-1 h-7 w-7 opacity-60 group-hover:opacity-100" aria-label={`Actions for ${app.company}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={onOpen}>
              <Pencil aria-hidden /> Edit details
            </DropdownMenuItem>
            {app.jobUrl && (
              <DropdownMenuItem asChild>
                <a href={app.jobUrl} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden /> Open job posting
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Move to</DropdownMenuLabel>
            {STATUSES.filter((s) => s.value !== app.status).map((s) => (
              <DropdownMenuItem key={s.value} onSelect={() => moveTo(s.value)}>
                <span className={`h-2 w-2 rounded-full ${s.color}`} style={{ boxShadow: `0 0 6px ${s.hex}` }} aria-hidden />
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {(pay || app.followupDate || app.source) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-5 text-xs">
          {pay && <span className="rounded-md bg-muted px-1.5 py-0.5 tabular-nums text-muted-foreground">{pay}</span>}
          {app.source && <span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">{app.source}</span>}
          {app.followupDate && active && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-1.5 py-0.5',
                followUpDue ? 'bg-stage-interview/15 font-medium text-stage-interview' : 'bg-muted text-muted-foreground'
              )}
            >
              <BellRing className="h-3 w-3" aria-hidden />
              {followUpDue ? 'Follow up now' : formatDate(app.followupDate)}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
