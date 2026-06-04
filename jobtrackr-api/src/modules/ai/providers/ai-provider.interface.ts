export interface AiProvider {
  generateFollowUpEmail(company: string, role: string): Promise<string>;

  generateInterviewPrep(company: string, role: string): Promise<string[]>;

  generateMatchScore(input: {
    resumeText?: string | null;
    company: string;
    role: string;
    notes?: string | null;
    jobUrl?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
  }): Promise<{
    score: number;
    summary: string;
  }>;
}
