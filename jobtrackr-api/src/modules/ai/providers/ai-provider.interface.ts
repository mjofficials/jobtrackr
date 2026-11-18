/** Everything an AI feature may use about one application and its owner. */
export interface AiContext {
  userName: string;
  resumeText: string | null;
  company: string;
  role: string;
  status: string;
  source: string | null;
  jobUrl: string | null;
  notes: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  appliedDate: Date | null;
  followupDate: Date | null;
}

export interface FollowUpEmail {
  subject: string;
  body: string;
}

export interface InterviewPrep {
  questions: string[];
}

export interface MatchScore {
  /** 0-100 */
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
}

export interface AiProvider {
  generateFollowUpEmail(ctx: AiContext): Promise<FollowUpEmail>;
  generateInterviewPrep(ctx: AiContext): Promise<InterviewPrep>;
  generateMatchScore(ctx: AiContext): Promise<MatchScore>;
}

/** Injection token: resolves to ClaudeAiProvider when ANTHROPIC_API_KEY is set, else MockAiProvider. */
export const AI_PROVIDER = Symbol('AI_PROVIDER');
