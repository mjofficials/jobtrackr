import { Injectable } from '@nestjs/common';

@Injectable()
export class MockAiProvider {
  async generateFollowUpEmail(company: string, role: string): Promise<string> {
    return `
        Dear Hiring Team,

        I hope you're doing well.

        I wanted to follow up regarding my application for the ${role} position at ${company}.

        I remain very interested in the opportunity and would appreciate any updates regarding the hiring process.

        Thank you for your time and consideration.

        Best regards
    `;
  }

  async generateInterviewPrep(company: string, role: string): Promise<string[]> {
    return [
      `Tell me about yourself.`,
      `Why do you want to work at ${company}?`,
      `Why are you interested in the ${role} position?`,
      `Describe a challenging project you've worked on.`,
      `What are your strengths and weaknesses?`,
      `Why should we hire you?`,
    ];
  }

  async generateMatchScore(input: {
    resumeText?: string | null;
    company: string;
    role: string;
    notes?: string | null;
    jobUrl?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
  }) {
    let score = 40;

    if (input.resumeText) score += 20;
    if (input.notes) score += 10;
    if (input.jobUrl) score += 10;
    if (input.salaryMin) score += 10;
    if (input.salaryMax) score += 10;

    score = Math.min(score, 100);

    let summary = '';

    if (score >= 80) {
      summary = 'Strong match based on available profile and application information.';
    } else if (score >= 60) {
      summary = 'Moderate match with some relevant information available.';
    } else {
      summary = 'Limited information available to determine job compatibility.';
    }

    return {
      score,
      summary,
    };
  }
}
