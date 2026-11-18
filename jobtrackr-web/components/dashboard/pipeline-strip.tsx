import { STATUSES, stageGlow, stageTint } from '@/lib/constants';
import type { DashboardSummary } from '@/types';

const KEY = { SAVED: 'saved', APPLIED: 'applied', INTERVIEW: 'interview', OFFER: 'offer', REJECTED: 'rejected' } as const;

/** The whole job search in one glowing bar: each stage's width is its share of all applications. */
export function PipelineStrip({ summary }: { summary: DashboardSummary }) {
  const total = summary.totalApplications;
  const stages = STATUSES.map((s) => ({ ...s, count: summary[KEY[s.value]] }));

  return (
    <figure>
      <figcaption className="sr-only">{stages.map((s) => `${s.label}: ${s.count}`).join(', ')}</figcaption>
      <div className="flex h-3 gap-1" aria-hidden>
        {total === 0 ? (
          <div className="flex-1 rounded-full bg-muted" />
        ) : (
          stages
            .filter((s) => s.count > 0)
            .map((s, i) => (
              <div
                key={s.value}
                className={`${s.color} animate-grow-x origin-left rounded-full`}
                style={{ flexGrow: s.count, boxShadow: stageGlow(s, 18), animationDelay: `${i * 80}ms` }}
              />
            ))
        )}
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-5">
        {stages.map((s) => (
          <div key={s.value} className="border-l-2 pl-4" style={{ borderColor: stageTint(s, 0.4) }}>
            <dt className={`text-sm font-medium ${s.text}`}>{s.label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tabular-nums">{s.count}</span>
              {total > 0 && (
                <span className="text-xs tabular-nums text-muted-foreground">{Math.round((s.count / total) * 100)}%</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
