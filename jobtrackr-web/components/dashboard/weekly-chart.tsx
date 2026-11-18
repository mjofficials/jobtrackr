'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Application } from '@/types';

const WEEKS = 8;
const config = { added: { label: 'Added', color: 'hsl(var(--primary))' } } satisfies ChartConfig;

/** Applications added per week over the last 8 weeks (weeks start Monday). */
function bucket(apps: Application[]) {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(monday);
    start.setDate(start.getDate() - (WEEKS - 1 - i) * 7);
    return { start, week: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), added: 0 };
  });
  for (const a of apps) {
    const t = new Date(a.createdAt).getTime();
    for (let i = WEEKS - 1; i >= 0; i--) {
      if (t >= weeks[i].start.getTime()) {
        weeks[i].added++;
        break;
      }
    }
  }
  return weeks;
}

export function WeeklyChart({ apps }: { apps: Application[] }) {
  const data = bucket(apps);
  return (
    <ChartContainer config={config} className="h-48 w-full">
      <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-added)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--color-added)" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={40} />
        <ChartTooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent labelFormatter={(l) => `Week of ${l}`} />} />
        <Bar dataKey="added" fill="url(#bar)" radius={[6, 6, 2, 2]} maxBarSize={36} />
      </BarChart>
    </ChartContainer>
  );
}
