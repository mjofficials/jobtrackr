# Light / dark theme

**Why:** Recruiters viewing the portfolio demo may prefer light. First impression should match their device.
**Goal:** Light + dark themes; default follows the device setting; a toggle overrides and is remembered. No flash of the wrong theme.
**Non-goals:** per-user theme stored on the server; more than two themes.
**Anti-goal:** light mode that looks like an unfinished afterthought (washed-out stage colours, muddy glows).

## Approaches
1. **CSS variables + next-themes (picked).** Every colour, including stage colours and glow strength, is a variable with light/dark values.
2. Tailwind `dark:` per element: about 15 duplicated spots, and inline glow styles can't use it. Rejected.
3. Separate stylesheets: duplicates shadcn's variable system. Rejected.

## Design (approved in conversation)
- Light: bg `#F6F7FB`, card `#FFFFFF`, border `#E3E6EF`, text `#141A23`, muted `#5B6577`, primary `#4F55E0`.
- Light stage colours: Saved `#64748B`, Applied `#2563EB`, Interview `#B45309`, Offer `#047857`, Rejected `#DC2626`. Dark stage colours unchanged.
- Glow → a `--glow-alpha` variable: strong in dark, faint in light (soft coloured shadow). Badge tints at ~10%. Top haze ~5% in light.
- Toggle: a sun/moon button by the avatar (sidebar + mobile bar) and top-right on auth pages. The avatar menu has a Theme radio group (Light / Dark / System).
- *My call:* stage colours are exposed as RGB triplet variables so Tailwind opacity modifiers (`bg-stage-x/15`) keep working.
