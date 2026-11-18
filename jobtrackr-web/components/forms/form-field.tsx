import { cloneElement, isValidElement, useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  /**
   * A single input/textarea (receives id + aria props automatically), or a
   * function that places those props itself — for controls wrapped in a
   * react-hook-form Controller, where the direct child isn't the control.
   */
  children: React.ReactElement | ((props: ControlProps) => React.ReactElement);
}

export interface ControlProps {
  id: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function FormField({ label, error, hint, className, children }: FormFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const props: ControlProps = { id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': describedBy };
  const control =
    typeof children === 'function'
      ? children(props)
      : isValidElement(children)
        ? cloneElement(children as React.ReactElement<Record<string, unknown>>, { ...props })
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
