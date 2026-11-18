'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { useApplications, useMoveApplication } from '@/hooks/use-api';
import { useDebounce } from '@/hooks/use-debounce';
import { STATUSES, ROUTES, statusMeta, type StageMeta } from '@/lib/constants';
import { getErrorMessage } from '@/lib/form-utils';
import { cn } from '@/lib/utils';
import { ApplicationCard } from '@/components/applications/application-card';
import { ApplicationForm } from '@/components/applications/application-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Application, ApplicationStatus } from '@/types';

type Editing = { app?: Application; status?: ApplicationStatus } | null;

function Column({ stage, items, loading, onOpen, onAdd }: {
  stage: StageMeta;
  items: Application[];
  loading: boolean;
  onOpen: (a: Application) => void;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`col-${stage.value}`}
      className={cn(
        'flex min-h-[24rem] flex-col rounded-2xl border border-transparent bg-card/40 p-2.5 transition-colors',
        isOver && 'border-dashed bg-accent/40'
      )}
      style={isOver ? { borderColor: `${stage.hex}88` } : undefined}
    >
      <header className="flex items-center justify-between px-1.5 pb-3 pt-1">
        <h2 id={`col-${stage.value}`} className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal">
          <span className={`h-2 w-2 rounded-full ${stage.color}`} style={{ boxShadow: `0 0 10px ${stage.hex}` }} aria-hidden />
          {stage.label}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{items.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-2">
        {loading && <Skeleton className="h-20 rounded-xl" />}
        {items.map((app) => (
          <ApplicationCard key={app.id} app={app} onOpen={() => onOpen(app)} />
        ))}
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add
          <span className="sr-only"> to {stage.label}</span>
        </button>
      </div>
    </section>
  );
}

function Board() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: apps, isPending, error } = useApplications();
  const move = useMoveApplication();
  const [query, setQuery] = useState('');
  const q = useDebounce(query, 200).trim().toLowerCase();
  const [editing, setEditing] = useState<Editing>(params.get('new') ? {} : null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Small activation distance so a click on the handle doesn't start a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const close = () => {
    setEditing(null);
    if (params.get('new')) router.replace(ROUTES.applications);
  };

  const columns = useMemo(() => {
    const visible = (apps ?? []).filter(
      (a) => !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
    );
    return STATUSES.map((s) => ({ stage: s, items: visible.filter((a) => a.status === s.value) }));
  }, [apps, q]);

  const dragged = apps?.find((a) => a.id === dragId);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragId(null);
    const app = apps?.find((a) => a.id === active.id);
    const status = over?.id as ApplicationStatus | undefined;
    if (!app || !status || app.status === status) return;
    move.mutate(
      { id: app.id, status },
      {
        onSuccess: () => toast(`${app.company} moved to ${statusMeta(status).label}`),
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Applications</h1>
          <p className="mt-1.5 text-muted-foreground">Drag a card to move it to the next stage.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search company or role"
              aria-label="Search applications"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setEditing({})} className="shrink-0 shadow-glow">
            <Plus aria-hidden /> Add application
          </Button>
        </div>
      </header>

      {error && <p role="alert" className="mb-6 text-destructive">{getErrorMessage(error)}</p>}

      <DndContext sensors={sensors} onDragStart={(e) => setDragId(String(e.active.id))} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
        {/* One column per stage. Scrolls sideways on narrow screens. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          <div className="grid min-w-[68rem] grid-cols-5 gap-3">
            {columns.map(({ stage, items }) => (
              <Column
                key={stage.value}
                stage={stage}
                items={items}
                loading={isPending}
                onOpen={(app) => setEditing({ app })}
                onAdd={() => setEditing({ status: stage.value })}
              />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {dragged && <ApplicationCard app={dragged} onOpen={() => {}} overlay />}
        </DragOverlay>
      </DndContext>

      {apps && apps.length > 0 && q && columns.every((c) => c.items.length === 0) && (
        <p className="mt-2 text-muted-foreground">No applications match “{query}”.</p>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing?.app ? 'Edit application' : 'Add application'}</DialogTitle>
            <DialogDescription>
              {editing?.app ? `${editing.app.role} at ${editing.app.company}` : 'Only company and role are required. Fill in the rest as you go.'}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ApplicationForm
              key={editing.app?.id ?? `new-${editing.status}`}
              application={editing.app}
              defaultStatus={editing.status}
              onDone={close}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}
