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
  /** Raw hex for glows and charts */
  hex: string;
}

export const STATUSES: StageMeta[] = [
  { value: 'SAVED', label: 'Saved', color: 'bg-stage-saved', text: 'text-stage-saved', hex: '#94A3B8' },
  { value: 'APPLIED', label: 'Applied', color: 'bg-stage-applied', text: 'text-stage-applied', hex: '#5B9BFF' },
  { value: 'INTERVIEW', label: 'Interview', color: 'bg-stage-interview', text: 'text-stage-interview', hex: '#F5B544' },
  { value: 'OFFER', label: 'Offer', color: 'bg-stage-offer', text: 'text-stage-offer', hex: '#3DDC97' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-stage-rejected', text: 'text-stage-rejected', hex: '#FF6B6B' },
];

export const statusMeta = (s: ApplicationStatus) => STATUSES.find((x) => x.value === s)!;
