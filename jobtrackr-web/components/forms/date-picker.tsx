'use client';

import { forwardRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DatePreset {
  label: string;
  /** Offset from today in days: -1 = yesterday, 7 = in a week. */
  days: number;
}

interface DatePickerProps {
  /** 'YYYY-MM-DD' or '' */
  value: string;
  onChange: (value: string) => void;
  presets?: DatePreset[];
  placeholder?: string;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

// Local-date helpers. Never go through toISOString() here: in IST that shifts
// midnight back a day, so picking 18 Nov would store 17 Nov.
const parse = (v: string) => {
  if (!v) return undefined;
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const pad = (n: number) => String(n).padStart(2, '0');
const serialize = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const display = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fromToday = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

/** A themed popover calendar whose trigger matches the shadcn Select. */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, presets = [], placeholder = 'Pick a date', ...aria }, ref) => {
    const [open, setOpen] = useState(false);
    const selected = parse(value);

    const pick = (d: Date | undefined) => {
      onChange(d ? serialize(d) : '');
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            {...aria}
            className={cn(
              'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
              'focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive',
              !selected && 'text-muted-foreground'
            )}
          >
            {selected ? display(selected) : placeholder}
            <CalendarDays className="h-4 w-4 opacity-50" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {presets.length > 0 && (
            <div className="flex gap-1.5 border-b p-2">
              {presets.map((p) => (
                <Button key={p.label} type="button" variant="secondary" size="sm" className="h-7 flex-1 text-xs" onClick={() => pick(fromToday(p.days))}>
                  {p.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            mode="single"
            selected={selected}
            onSelect={pick}
            defaultMonth={selected}
            weekStartsOn={1}
            autoFocus
            className="bg-transparent"
          />
          {selected && (
            <div className="border-t p-2">
              <Button type="button" variant="ghost" size="sm" className="h-7 w-full text-xs text-muted-foreground" onClick={() => pick(undefined)}>
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = 'DatePicker';
