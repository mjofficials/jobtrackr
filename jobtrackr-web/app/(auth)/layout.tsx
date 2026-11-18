import { Briefcase } from 'lucide-react';
import { STATUSES } from '@/lib/constants';

// Illustrative cards for the brand panel — not user data.
const SAMPLE = [
  { company: 'Northwind', role: 'Backend Engineer', stage: 1 },
  { company: 'Lumen Labs', role: 'Full-stack Developer', stage: 2 },
  { company: 'Kestrel', role: 'Platform Engineer', stage: 3 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
              <Briefcase className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="font-display text-xl font-bold">JobTrackr</span>
          </div>
          {children}
        </div>
      </div>

      {/* Brand panel: the pipeline idea, shown rather than described. */}
      <aside className="relative hidden overflow-hidden border-l bg-card lg:flex lg:flex-col lg:justify-center lg:px-16" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(40rem_24rem_at_80%_10%,hsl(var(--primary)/0.18),transparent_70%)]" />
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight">
            Every application, from saved to signed.
          </p>
          <div className="mt-10 flex h-2.5 gap-1">
            {STATUSES.map((s, i) => (
              <span
                key={s.value}
                className={`${s.color} animate-grow-x origin-left rounded-full`}
                style={{ flexGrow: [2, 5, 3, 1, 2][i], boxShadow: `0 0 16px ${s.hex}80`, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {SAMPLE.map((c) => {
              const s = STATUSES[c.stage];
              return (
                <div key={c.company} className="flex items-center justify-between rounded-xl border bg-background/60 px-4 py-3 backdrop-blur">
                  <div>
                    <p className="font-medium">{c.company}</p>
                    <p className="text-sm text-muted-foreground">{c.role}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-sm ${s.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} style={{ boxShadow: `0 0 8px ${s.hex}` }} />
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </main>
  );
}
