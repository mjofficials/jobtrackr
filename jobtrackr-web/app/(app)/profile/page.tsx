'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useAiUsage, useExtractResume, useProfile, useUpdateProfile } from '@/hooks/use-api';
import { getErrorMessage } from '@/lib/form-utils';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MAX_RESUME_CHARS = 50_000; // matches the API's UpdateProfileDto
const MAX_PDF_MB = 5;

export default function ProfilePage() {
  const { data: profile, isPending } = useProfile();
  const { data: usage } = useAiUsage();
  const update = useUpdateProfile();
  const extract = useExtractResume();

  const [name, setName] = useState('');
  const [resume, setResume] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Load server values once they arrive.
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setResume(profile.resumeText ?? '');
    }
  }, [profile]);

  const resumeDirty = profile !== undefined && resume !== (profile.resumeText ?? '');
  const nameDirty = profile !== undefined && name.trim() !== profile.name;

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return void toast.error('Choose a PDF file.');
    if (file.size > MAX_PDF_MB * 1024 * 1024) return void toast.error(`That PDF is over ${MAX_PDF_MB} MB.`);
    extract.mutate(file, {
      onSuccess: ({ text, pages }) => {
        setResume(text);
        toast.success(`Read ${pages} page${pages === 1 ? '' : 's'} from ${file.name}`, {
          description: 'Check the text below, fix anything that looks off, then save.',
        });
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const save = (input: { name?: string; resumeText?: string }, label: string) =>
    update.mutate(input, {
      onSuccess: () => toast.success(label),
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const pct = usage ? Math.round((usage.used / usage.limit) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold md:text-4xl">Profile</h1>
        <p className="mt-1.5 text-muted-foreground">Your resume powers the match score, interview prep and follow-up emails.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" aria-hidden /> Resume
            </CardTitle>
            <CardDescription>Upload a PDF to fill this in, or paste the text yourself.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                onFile(e.dataTransfer.files[0]);
              }}
              disabled={extract.isPending}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                'hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                dragging && 'border-primary bg-primary/10'
              )}
            >
              {extract.isPending ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
              ) : (
                <UploadCloud className="h-7 w-7 text-primary" aria-hidden />
              )}
              <span className="font-medium">{extract.isPending ? 'Reading your resume…' : 'Upload resume PDF'}</span>
              <span className="text-sm text-muted-foreground">Drop it here or click to choose · up to {MAX_PDF_MB} MB</span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = ''; // allow re-selecting the same file
              }}
            />

            <FormField
              label="Resume text"
              hint={`${resume.length.toLocaleString()} / ${MAX_RESUME_CHARS.toLocaleString()} characters`}
              error={resume.length > MAX_RESUME_CHARS ? 'Too long. Trim older roles or detail.' : undefined}
            >
              <Textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                rows={16}
                placeholder="Paste your resume here, or upload a PDF above."
                className="font-mono text-xs leading-relaxed"
              />
            </FormField>

            <div className="flex items-center justify-end gap-3">
              {resumeDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
              {resumeDirty && (
                <Button variant="ghost" onClick={() => setResume(profile?.resumeText ?? '')}>
                  Discard
                </Button>
              )}
              <Button
                onClick={() => save({ resumeText: resume.trim() }, 'Resume saved')}
                disabled={!resumeDirty || resume.length > MAX_RESUME_CHARS || update.isPending}
              >
                {update.isPending && <Loader2 className="animate-spin" aria-hidden />}
                Save resume
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Name" error={name.trim().length > 0 && name.trim().length < 3 ? 'At least 3 characters' : undefined}>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </FormField>
              <FormField label="Email" hint="Used to log in. It can’t be changed here.">
                <Input value={profile?.email ?? ''} readOnly disabled />
              </FormField>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => save({ name: name.trim() }, 'Name updated')}
                disabled={!nameDirty || name.trim().length < 3 || update.isPending}
              >
                Save name
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden /> AI usage today
              </CardTitle>
              <CardDescription>Resets every day.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold tabular-nums">
                {usage ? usage.used : '–'}
                <span className="text-base font-normal text-muted-foreground"> / {usage?.limit ?? 20}</span>
              </p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="AI calls used today"
                aria-valuenow={usage?.used ?? 0}
                aria-valuemin={0}
                aria-valuemax={usage?.limit ?? 20}
              >
                <div className="h-full rounded-full bg-primary shadow-glow transition-[width]" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {usage ? `${usage.remaining} left for match scores, interview prep and emails.` : ' '}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
