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
