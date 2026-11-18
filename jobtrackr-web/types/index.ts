export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  source: string | null;
  jobUrl: string | null;
  notes: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  appliedDate: string | null;
  followupDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationInput = Partial<
  Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
> & Pick<Application, 'company' | 'role'>;

export interface ListResponse<T> {
  count: number;
  data: T[];
}

export interface DashboardSummary {
  totalApplications: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export interface DashboardActivity {
  applicationsThisMonth: number;
  applicationsLastMonth: number;
  interviews: number;
  offers: number;
  rejections: number;
}

export type RecentApplication = Pick<
  Application,
  'id' | 'company' | 'role' | 'status' | 'updatedAt'
>;

export interface Profile {
  id: string;
  email: string;
  name: string;
  resumeText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiUsage {
  used: number;
  limit: number;
  remaining: number;
}

export type AiKind = 'MATCH_SCORE' | 'INTERVIEW_PREP' | 'FOLLOW_UP_EMAIL';

export interface MatchScoreResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
}
export interface InterviewPrepResult {
  questions: string[];
}
export interface FollowUpEmailResult {
  subject: string;
  body: string;
}

export interface AiResultByKind {
  MATCH_SCORE: MatchScoreResult;
  INTERVIEW_PREP: InterviewPrepResult;
  FOLLOW_UP_EMAIL: FollowUpEmailResult;
}

export interface AiLog {
  id: string;
  type: AiKind;
  applicationId: string | null;
  createdAt: string;
  /** Present when listed per application. Older logs may be { text }. */
  result?: unknown;
}
