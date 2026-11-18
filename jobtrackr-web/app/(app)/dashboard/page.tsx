'use client';

import Link from 'next/link';
import { ArrowUpRight, BellRing, CalendarClock, Plus, Target, TrendingUp } from 'lucide-react';
import { useApplications, useDashboard, useMe } from '@/hooks/use-api';
import { PipelineStrip } from '@/components/dashboard/pipeline-strip';
import { WeeklyChart } from '@/components/dashboard/weekly-chart';
import { StatusBadge } from '@/components/applications/status-badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { getErrorMessage } from '@/lib/form-utils';

const DAY = 86_400_000;

function Stat({ icon: Icon, label, value, note, glow }: { icon: typeof Target; label: string; value: string; note: string; glow: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: glow, opacity: 'calc(var(--glow-alpha) / 3)' }} />
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden /> {label}
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: me } = useMe();
  const { summary, activity, recent } = useDashboard();
  const { data: apps } = useApplications();

  if (summary.isError) {
    return <p role="alert" className="text-destructive">{getErrorMessage(summary.error)}</p>;
  }

  const s = summary.data;
  const a = activity.data;
  const total = s?.totalApplications ?? 0;

  // Of everything sent out, how much got a reply that moved it forward?
  const sent = s ? total - s.saved : 0;
  const interviewRate = sent > 0 && s ? Math.round(((s.interview + s.offer) / sent) * 100) : null;
  const delta = a ? a.applicationsThisMonth - a.applicationsLastMonth : 0;

  const now = Date.now();
  const followUps = (apps ?? [])
    .filter((x) => x.followupDate && x.status !== 'OFFER' && x.status !== 'REJECTED')
    .filter((x) => new Date(x.followupDate!).getTime() < now + 7 * DAY)
    .sort((x, y) => +new Date(x.followupDate!) - +new Date(y.followupDate!))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{me ? `Hi, ${me.name.split(' ')[0]}` : 'Dashboard'}</h1>
        </div>
        <Link href={`${ROUTES.applications}?new=1`} className={cn(buttonVariants({ size: 'lg' }), 'shadow-glow')}>
          <Plus aria-hidden /> Add application
        </Link>
      </header>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Your pipeline</CardTitle>
            <CardDescription>
              {s ? (total === 0 ? 'Nothing tracked yet. Add the first job you’re looking at.' : `${total} applications across five stages`) : ' '}
            </CardDescription>
          </div>
          {total > 0 && (
            <Link href={ROUTES.applications} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Open board <ArrowUpRight aria-hidden />
            </Link>
          )}
        </CardHeader>
        <CardContent>{s ? <PipelineStrip summary={s} /> : <Skeleton className="h-28" />}</CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={Target}
          label="Interview rate"
          value={interviewRate === null ? '–' : `${interviewRate}%`}
          note={sent > 0 ? `of ${sent} sent applications reached interview or offer` : 'Shows once you’ve applied somewhere'}
          glow="rgb(var(--stage-interview))"
        />
        <Stat
          icon={TrendingUp}
          label="Added this month"
          value={a ? String(a.applicationsThisMonth) : '–'}
          note={!a || a.applicationsLastMonth === 0 ? 'No applications last month to compare' : delta === 0 ? 'Same as last month' : `${Math.abs(delta)} ${delta > 0 ? 'more' : 'fewer'} than last month`}
          glow="hsl(var(--primary))"
        />
        <Stat
          icon={BellRing}
          label="Follow-ups this week"
          value={apps ? String(followUps.length) : '–'}
          note={followUps.length ? 'Including any that are overdue' : 'You’re all caught up'}
          glow="rgb(var(--stage-offer))"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly activity</CardTitle>
            <CardDescription>Applications added per week, last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>{apps ? <WeeklyChart apps={apps} /> : <Skeleton className="h-48" />}</CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Follow up</CardTitle>
            <CardDescription>Due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {followUps.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                <CalendarClock className="h-6 w-6 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm text-muted-foreground">Set a follow-up date on an application to see it here.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {followUps.map((f) => {
                  const overdue = new Date(f.followupDate!).getTime() < now;
                  return (
                    <li key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{f.company}</p>
                        <p className="truncate text-xs text-muted-foreground">{f.role}</p>
                      </div>
                      <span className={cn('shrink-0 text-xs font-medium tabular-nums', overdue ? 'text-stage-rejected' : 'text-stage-interview')}>
                        {overdue ? 'Overdue' : formatDate(f.followupDate!)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {recent.data && recent.data.length > 0 ? (
            <ul className="divide-y">
              {recent.data.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3 transition-colors hover:bg-accent/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted font-display text-sm font-semibold">
                      {r.company[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.company}</p>
                      <p className="truncate text-sm text-muted-foreground">{r.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <StatusBadge status={r.status} />
                    <span className="w-24 text-right text-xs tabular-nums text-muted-foreground">{formatDate(r.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : recent.isPending ? (
            <div className="space-y-2 px-6"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
          ) : (
            <p className="px-6 pb-4 text-sm text-muted-foreground">Applications you add or move will show up here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
