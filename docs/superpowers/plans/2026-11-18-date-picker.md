# Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the native date inputs in the application form with a shadcn popover calendar that matches the Stage select.
**Architecture:** One `DatePicker` component (Popover + Calendar) with a `YYYY-MM-DD` string API, wired via RHF `Controller`.
**Tech Stack:** Next 14, Tailwind 3, shadcn (new-york), react-day-picker, react-hook-form.
**Spec:** docs/superpowers/specs/2026-11-18-date-picker-design.md

## Global Constraints
- Value format: `YYYY-MM-DD` string or `''` (keeps `toOptionalDate`/`toDateInput` unchanged).
- Display format: en-IN, `18 Nov 2026`. Weeks start Monday.
- Presets: Applied on → Today, Yesterday. Follow up on → In 1 week, In 2 weeks. Plus "Clear".

## Review Focus
- Timezone: picking 18 Nov must store 18 Nov, not 17 Nov (no `toISOString()` on a local date when building `YYYY-MM-DD`).
- Editing an existing application shows its saved date and opens the calendar on that month.
- Clear empties the field; on save, the API clears the value (null path already exists).
- Keyboard: Tab to the trigger, Enter opens it, arrow keys move between days, Esc closes.
- Picker inside the Dialog: the popover renders above the dialog and is clickable (z-index).

No unit-test runner exists in jobtrackr-web. Verification is `tsc` + lint + build + the Playwright e2e script.

---

### Task 1: DatePicker component + form wiring

**Files:**
- Create (shadcn CLI): `components/ui/popover.tsx`, `components/ui/calendar.tsx`
- Create: `components/forms/date-picker.tsx`
- Modify: `components/applications/application-form.tsx` (the two date fields)

**Interfaces:**
- Produces: `DatePicker({ value: string; onChange: (v: string) => void; presets?: { label: string; days: number }[]; placeholder?: string; id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string })`. `days` is an offset from today (−1 = yesterday).

- [ ] Step 1: `npx shadcn@2.3.0 add popover calendar`. Verify the installed react-day-picker major and that its API matches the generated calendar.tsx.
- [ ] Step 2: Implement `date-picker.tsx`. Trigger classes mirror SelectTrigger. Parse and format with local-date helpers (`new Date(y, m-1, d)`, and build the string from getFullYear/getMonth/getDate). Calendar uses `weekStartsOn={1}`, `defaultMonth` = selected date, and closes on select.
- [ ] Step 3: Replace both `<Input type="date">` with `Controller` + `DatePicker` and the presets above.
- [ ] Step 4: `npx tsc --noEmit && npm run lint && npm run build`. Expected: no errors.
- [ ] Step 5: In the e2e script, open Add application, click the Follow up on trigger, click "In 1 week", save, reopen, and assert the trigger shows today+7 in en-IN format. Screenshot the open popover. Expected: pass, no console errors.
