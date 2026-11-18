import { cloneElement, isValidElement, useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  /** A single input, textarea or SelectTrigger. It receives id and aria props. */
  children: React.ReactElement;
}

export function FormField({ label, error, hint, className, children }: FormFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-muted-foreground">{label}</Label>
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
