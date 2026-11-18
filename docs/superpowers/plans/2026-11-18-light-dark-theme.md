# Light / Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Device-following light/dark theme with a toggle. **Spec:** docs/superpowers/specs/2026-11-18-light-dark-theme-design.md
**Tech Stack:** next-themes 0.4, Tailwind 3 (darkMode: class), shadcn CSS variables.

## Review Focus
- No theme flash on first load or hard refresh (next-themes script + `suppressHydrationWarning`).
- No hydration warning from the toggle icon (icon chosen by CSS `dark:` classes, not JS).
- Stage text contrast in light: badges, column dots and follow-up labels stay readable.
- The Theme radio shows the right selection when on System.
- Toasts and the Radix popover/dropdown portals follow the theme.

### Task 1: Tokens + provider
- [ ] globals.css: `:root` = light, `.dark` = current dark; add `--stage-*` (RGB triplets), `--glow-alpha`, `--haze-alpha`.
- [ ] tailwind: `stage.*` = `rgb(var(--stage-*) / <alpha-value>)`; `shadow-glow` uses `--glow-alpha`.
- [ ] layout.tsx: drop the hardcoded `dark`, wrap in next-themes `ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`, remove the Toaster `theme` prop.

### Task 2: Replace hardcoded hex
- [ ] constants: `StageMeta.hex` → `stageColor(s, alpha?)` and `stageGlow(s, blurPx)` helpers returning CSS strings.
- [ ] Update every `.hex` usage (grep) and the Stat `glow` props.

### Task 3: Toggle
- [ ] `components/layout/theme-toggle.tsx`: icon button (Sun/Moon via `dark:` classes) toggling `resolvedTheme`.
- [ ] Sidebar: toggle next to the avatar and in the mobile bar; Theme radio group in the avatar menu. Auth layout: toggle top-right.

### Verify
- [ ] tsc + lint + build; Playwright on isolated ports 3100/4100: screenshot dashboard, board and login with `color_scheme` light and dark; toggle click switches the `html` class and persists across reload; no console errors.
