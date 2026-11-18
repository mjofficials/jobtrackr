# Date picker for the application form

**Why:** The native `<input type="date">` looks out of place next to the shadcn Select: browser-chosen format (mm/dd/yyyy), icon not aligned, unthemed browser popup. The date fields should feel like the Stage dropdown.

**Goal:** "Applied on" and "Follow up on" use a themed popover calendar that matches the Select trigger and opens with the same animation.
**Non-goals:** date ranges, times, changing the API or data format.
**Anti-goal:** typing a date by keyboard becoming impossible. The calendar must stay keyboard-navigable (react-day-picker supports arrow keys).

## Approaches
1. **shadcn Popover + Calendar (picked).** The trigger matches SelectTrigger, the calendar is themed, and the motion matches Select.
2. Restyle the native input. The popup still belongs to the browser, so rejected.
3. react-datepicker or similar. A separate look that needs restyling, so rejected.

## Design
- Add the shadcn `popover` and `calendar` components (react-day-picker).
- New `components/forms/date-picker.tsx`: `DatePicker({ value, onChange, presets, placeholder })`.
  - `value` / `onChange` use a `YYYY-MM-DD` string | '' so the form schema and `toOptionalDate` / `toDateInput` stay unchanged.
  - Trigger: same height, border and focus ring as SelectTrigger. Shows "18 Nov 2026" (en-IN), or the placeholder in muted text. Calendar icon on the right.
  - Popover: a row of preset buttons, the month calendar, and a "Clear" link. Picking a day or preset closes it.
- Presets: Applied on → Today, Yesterday. Follow up on → In 1 week, In 2 weeks.
- Wired through react-hook-form `Controller`, in the same way as Stage.
- *My call:* weeks start on Monday, and future dates are allowed for both fields (no min/max).
