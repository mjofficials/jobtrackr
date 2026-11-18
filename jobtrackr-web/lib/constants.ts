import type { ApplicationStatus } from '@/types';

export const APP_NAME = 'JobTrackr';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Cookie holding the API's JWT. Readable by middleware for route protection. */
export const TOKEN_COOKIE = 'jt_token';

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  applications: '/applications',
} as const;

export const PUBLIC_ROUTES: string[] = [ROUTES.login, ROUTES.register];

export const QUERY_KEYS = {
  me: ['me'],
  applications: ['applications'],
  dashboardSummary: ['dashboard', 'summary'],
  dashboardActivity: ['dashboard', 'activity'],
  dashboardRecent: ['dashboard', 'recent'],
} as const;

export interface StageMeta {
  value: ApplicationStatus;
  label: string;
  /** Tailwind background class */
  color: string;
  /** Tailwind text class */
  text: string;
  /** CSS variable holding the stage's RGB triplet (theme-aware) */
  rgb: string;
}

export const STATUSES: StageMeta[] = [
  { value: 'SAVED', label: 'Saved', color: 'bg-stage-saved', text: 'text-stage-saved', rgb: 'var(--stage-saved)' },
  { value: 'APPLIED', label: 'Applied', color: 'bg-stage-applied', text: 'text-stage-applied', rgb: 'var(--stage-applied)' },
  { value: 'INTERVIEW', label: 'Interview', color: 'bg-stage-interview', text: 'text-stage-interview', rgb: 'var(--stage-interview)' },
  { value: 'OFFER', label: 'Offer', color: 'bg-stage-offer', text: 'text-stage-offer', rgb: 'var(--stage-offer)' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-stage-rejected', text: 'text-stage-rejected', rgb: 'var(--stage-rejected)' },
];

/** Stage colour at an opacity, e.g. for tinted backgrounds and borders. */
export const stageTint = (s: StageMeta, alpha: number) => `rgb(${s.rgb} / ${alpha})`;

/** Halo around a stage-coloured element: strong in dark, a faint shadow in light. */
export const stageGlow = (s: StageMeta, blurPx: number) => `0 0 ${blurPx}px rgb(${s.rgb} / var(--glow-alpha))`;

export const statusMeta = (s: ApplicationStatus) => STATUSES.find((x) => x.value === s)!;
