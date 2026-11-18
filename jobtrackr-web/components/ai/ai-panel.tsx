'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { AlertTriangle, Check, Copy, Loader2, Mail, MessagesSquare, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useAiLogs, useAiUsage, useGenerateAi } from '@/hooks/use-api';
import { ROUTES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/form-utils';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AiKind,
  AiLog,
  Application,
  FollowUpEmailResult,
  InterviewPrepResult,
  MatchScoreResult,
} from '@/types';

const TABS: { kind: AiKind; label: string; icon: typeof Target; blurb: string; waiting: string }[] = [
  { kind: 'MATCH_SCORE', label: 'Match', icon: Target, blurb: 'How well your resume fits this role, with strengths and gaps.', waiting: 'Comparing your resume with the role…' },
  { kind: 'INTERVIEW_PREP', label: 'Interview prep', icon: MessagesSquare, blurb: 'Questions you’re likely to be asked for this role.', waiting: 'Thinking about what they’ll ask…' },
  { kind: 'FOLLOW_UP_EMAIL', label: 'Follow-up', icon: Mail, blurb: 'A short follow-up email you can send the hiring team.', waiting: 'Drafting your email…' },
];

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check aria-hidden /> : <Copy aria-hidden />}
      {done ? 'Copied' : label}
    </Button>
  );
}

/** Score ring: the arc's colour borrows the stage palette (offer / interview / rejected). */
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const v = score >= 75 ? '--stage-offer' : score >= 50 ? '--stage-interview' : '--stage-rejected';
  const verdict = score >= 75 ? 'Strong fit' : score >= 50 ? 'Partial fit' : 'Weak fit';
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`Match score ${score} out of 100`}>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ stroke: `rgb(var(${v}))`, filter: `drop-shadow(0 0 6px rgb(var(${v}) / var(--glow-alpha)))`, transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-foreground font-display text-3xl font-semibold" style={{ transformOrigin: '60px 60px' }}>
          {score}
        </text>
      </svg>
      <div>
        <p className="font-display text-xl font-semibold" style={{ color: `rgb(var(${v}))` }}>{verdict}</p>
        <p className="text-sm text-muted-foreground">out of 100</p>
      </div>
    </div>
  );
}

function MatchView({ r }: { r: MatchScoreResult }) {
  return (
    <div className="space-y-5">
      <ScoreRing score={r.score} />
      <p className="leading-relaxed">{r.summary}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <section>
          <h4 className="mb-2 font-sans text-sm font-semibold tracking-normal text-stage-offer">Strengths</h4>
          <ul className="space-y-2 text-sm">
            {r.strengths.map((s) => (
              <li key={s} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-stage-offer" aria-hidden />{s}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-2 font-sans text-sm font-semibold tracking-normal text-stage-interview">Gaps to address</h4>
          <ul className="space-y-2 text-sm">
            {r.gaps.map((g) => (
              <li key={g} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-stage-interview" aria-hidden />{g}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PrepView({ r }: { r: InterviewPrepResult }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CopyButton text={r.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')} label="Copy all" />
      </div>
      {/* Ordered: most likely questions first. */}
      <ol className="space-y-2">
        {r.questions.map((q, i) => (
          <li key={q} className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
            <span className="w-5 shrink-0 text-right font-semibold tabular-nums text-primary">{i + 1}</span>
            {q}
          </li>
        ))}
      </ol>
    </div>
  );
}

function EmailView({ r }: { r: FollowUpEmailResult }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3 border-b pb-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Subject</p>
          <p className="font-medium">{r.subject}</p>
        </div>
        <CopyButton text={r.subject} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{r.body}</p>
      <div className="flex justify-end gap-2 border-t pt-3">
        <a
          href={`mailto:?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.body)}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Mail aria-hidden /> Open in mail app
        </a>
        <CopyButton text={r.body} label="Copy email" />
      </div>
    </div>
  );
}

function ResultView({ kind, result }: { kind: AiKind; result: unknown }) {
  // Logs from before Phase 3 stored plain text.
  if (result && typeof result === 'object' && 'text' in result) {
    return <p className="whitespace-pre-wrap text-sm">{String((result as { text: string }).text)}</p>;
  }
  if (kind === 'MATCH_SCORE') return <MatchView r={result as MatchScoreResult} />;
  if (kind === 'INTERVIEW_PREP') return <PrepView r={result as InterviewPrepResult} />;
  return <EmailView r={result as FollowUpEmailResult} />;
}

function KindTab({ kind, app, logs, loadingLogs }: { kind: AiKind; app: Application; logs: AiLog[]; loadingLogs: boolean }) {
  const meta = TABS.find((t) => t.kind === kind)!;
  const generate = useGenerateAi(kind, app.id);
  const history = logs.filter((l) => l.type === kind && l.result);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Show a fresh result straight from the response; the history refetch lags behind.
  const fresh = generate.data ? { id: 'fresh', result: generate.data as unknown } : undefined;
  const selected = (selectedId && history.find((l) => l.id === selectedId)) || fresh || history[0];

  const run = () =>
    generate.mutate(undefined, {
      onSuccess: () => setSelectedId(null), // jump to the newest result
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const needsResume = isAxiosError(generate.error) && /resume/i.test(getErrorMessage(generate.error));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{meta.blurb}</p>
        <Button onClick={run} disabled={generate.isPending} className="shrink-0 shadow-glow">
          {generate.isPending ? <Loader2 className="animate-spin" aria-hidden /> : selected ? <RefreshCw aria-hidden /> : <Sparkles aria-hidden />}
          {selected ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {generate.isPending ? (
        <div className="space-y-3" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-primary"><Sparkles className="h-4 w-4 animate-pulse" aria-hidden />{meta.waiting}</p>
          <Skeleton className="h-24" />
          <Skeleton className="h-16" />
        </div>
      ) : needsResume ? (
        <div className="rounded-xl border border-dashed p-5 text-center">
          <p className="font-medium">Your resume is needed for a match score</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload or paste it once on your profile, then come back.</p>
          <Link href={ROUTES.profile} className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>Add resume</Link>
        </div>
      ) : loadingLogs ? (
        <Skeleton className="h-40" />
      ) : selected ? (
        <ResultView kind={kind} result={selected.result} />
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <meta.icon className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-sm text-muted-foreground">Nothing generated yet. Uses 1 of your daily AI calls.</p>
        </div>
      )}

      {history.length > 1 && !generate.isPending && (
        <div className="border-t pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Earlier results</p>
          <div className="flex flex-wrap gap-1.5">
            {history.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  l.id === selected?.id ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {new Date(l.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AiPanelProps {
  application: Application | null;
  initialTab?: AiKind;
  onOpenChange: (open: boolean) => void;
}

export function AiPanel({ application, initialTab = 'MATCH_SCORE', onOpenChange }: AiPanelProps) {
  const { data: usage } = useAiUsage();
  const { data: logs = [], isPending: loadingLogs } = useAiLogs(application?.id);

  return (
    <Sheet open={application !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {application && (
          <>
            <SheetHeader className="pr-8 text-left">
              <SheetTitle className="flex items-center gap-2 font-display text-xl">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden /> AI assistant
              </SheetTitle>
              <SheetDescription>
                {application.role} at {application.company}
                {usage && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{usage.remaining} AI calls left today</span>}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue={initialTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                {TABS.map(({ kind, label, icon: Icon }) => (
                  <TabsTrigger key={kind} value={kind}>
                    <Icon aria-hidden /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TABS.map(({ kind }) => (
                <TabsContent key={kind} value={kind} className="pt-4">
                  <KindTab kind={kind} app={application} logs={logs} loadingLogs={loadingLogs} />
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
