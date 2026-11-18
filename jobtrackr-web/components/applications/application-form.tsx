'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { useDeleteApplication, useSaveApplication } from '@/hooks/use-api';
import { STATUSES, stageGlow } from '@/lib/constants';
import { getErrorMessage, toDateInput, toOptionalDate, toOptionalInt } from '@/lib/form-utils';
import { FormField } from '@/components/forms/form-field';
import { DatePicker, type DatePreset } from '@/components/forms/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Application, ApplicationStatus } from '@/types';

const APPLIED_PRESETS: DatePreset[] = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: -1 },
];
const FOLLOWUP_PRESETS: DatePreset[] = [
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
];

const optionalNumber = z
  .string()
  .optional()
  .refine((v) => !v || /^\d+$/.test(v), 'Whole numbers only');

const schema = z
  .object({
    company: z.string().trim().min(1, 'Add the company name'),
    role: z.string().trim().min(1, 'Add the role'),
    status: z.enum(['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
    jobUrl: z.union([z.literal(''), z.url('Enter a full URL, starting with https://')]).optional(),
    source: z.string().optional(),
    salaryMin: optionalNumber,
    salaryMax: optionalNumber,
    currency: z.string().length(3, '3 letters, like INR'),
    appliedDate: z.string().optional(),
    followupDate: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => !v.salaryMin || !v.salaryMax || +v.salaryMin <= +v.salaryMax, {
    path: ['salaryMax'],
    message: 'Max should be at least the min',
  });
type Values = z.infer<typeof schema>;

interface Props {
  application?: Application;
  defaultStatus?: ApplicationStatus;
  onDone: () => void;
}

export function ApplicationForm({ application: app, defaultStatus = 'SAVED', onDone }: Props) {
  const save = useSaveApplication();
  const remove = useDeleteApplication();
  const { register, handleSubmit, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: app?.company ?? '',
      role: app?.role ?? '',
      status: app?.status ?? defaultStatus,
      jobUrl: app?.jobUrl ?? '',
      source: app?.source ?? '',
      salaryMin: app?.salaryMin?.toString() ?? '',
      salaryMax: app?.salaryMax?.toString() ?? '',
      currency: app?.currency ?? 'INR',
      appliedDate: toDateInput(app?.appliedDate),
      followupDate: toDateInput(app?.followupDate),
      notes: app?.notes ?? '',
    },
  });
  const e = formState.errors;

  // On edit, an emptied field is sent as null so the API clears it; on create it's just omitted.
  const empty = app ? null : undefined;
  const onSubmit = (v: Values) =>
    save.mutate(
      {
        id: app?.id,
        company: v.company,
        role: v.role,
        status: v.status,
        currency: v.currency.toUpperCase(),
        jobUrl: v.jobUrl || empty,
        source: v.source || empty,
        notes: v.notes || empty,
        salaryMin: toOptionalInt(v.salaryMin) ?? empty,
        salaryMax: toOptionalInt(v.salaryMax) ?? empty,
        appliedDate: toOptionalDate(v.appliedDate) ?? empty,
        followupDate: toOptionalDate(v.followupDate) ?? empty,
      },
      {
        onSuccess: (saved) => {
          toast.success(app ? 'Changes saved' : `Added ${saved.company}`);
          onDone();
        },
      }
    );

  const onDelete = () =>
    app &&
    remove.mutate(app.id, {
      onSuccess: () => {
        toast.success(`Deleted ${app.company}`);
        onDone();
      },
    });

  const error = save.error ?? remove.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company" error={e.company?.message}>
          <Input autoFocus {...register('company')} />
        </FormField>
        <FormField label="Role" error={e.role?.message}>
          <Input {...register('role')} />
        </FormField>
        <FormField label="Stage">
          {(aria) => (
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger {...aria}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${s.color}`}
                            style={{ boxShadow: stageGlow(s, 6) }}
                          />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField label="Found on" hint="LinkedIn, referral, company site…">
          <Input {...register('source')} />
        </FormField>
        <FormField label="Job posting link" error={e.jobUrl?.message} className="sm:col-span-2">
          <Input type="url" placeholder="https://" {...register('jobUrl')} />
        </FormField>
      </div>

      <Separator />

      <div className="grid grid-cols-[1fr_1fr_5.5rem] gap-3">
        <FormField label="Salary min (yearly)" error={e.salaryMin?.message}>
          <Input inputMode="numeric" placeholder="1800000" {...register('salaryMin')} />
        </FormField>
        <FormField label="Salary max" error={e.salaryMax?.message}>
          <Input inputMode="numeric" placeholder="2600000" {...register('salaryMax')} />
        </FormField>
        <FormField label="Currency" error={e.currency?.message}>
          <Input maxLength={3} className="uppercase" {...register('currency')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Applied on">
          {(aria) => (
            <Controller
              control={control}
              name="appliedDate"
              render={({ field }) => (
                <DatePicker
                  {...aria}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  presets={APPLIED_PRESETS}
                />
              )}
            />
          )}
        </FormField>
        <FormField label="Follow up on">
          {(aria) => (
            <Controller
              control={control}
              name="followupDate"
              render={({ field }) => (
                <DatePicker
                  {...aria}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  presets={FOLLOWUP_PRESETS}
                />
              )}
            />
          )}
        </FormField>
      </div>

      <FormField label="Notes">
        <Textarea
          rows={3}
          placeholder="Recruiter name, referral, what stood out…"
          {...register('notes')}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
        {app && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
              >
                <Trash2 aria-hidden /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {app.company}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {app.role} at {app.company} will be removed from your board. This can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete application
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button type="button" variant="outline" className="sm:ml-auto" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {app ? 'Save changes' : 'Add application'}
        </Button>
      </div>
    </form>
  );
}
