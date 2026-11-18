import { Injectable } from '@nestjs/common';
import { AiContext, AiProvider, FollowUpEmail, InterviewPrep, MatchScore } from './ai-provider.interface';

/** Deterministic stand-in used when no ANTHROPIC_API_KEY is configured (local dev, tests, demos). */
@Injectable()
export class MockAiProvider implements AiProvider {
  async generateFollowUpEmail(ctx: AiContext): Promise<FollowUpEmail> {
    return {
      subject: `Following up on my ${ctx.role} application`,
      body: [
        'Hi there,',
        '',
        `I hope you're doing well. I wanted to follow up on my application for the ${ctx.role} role at ${ctx.company}.`,
        `I'm still very interested in the position and would be glad to share anything else that helps your decision.`,
        '',
        'Thanks for your time,',
        ctx.userName,
        '',
        '(Sample text: add ANTHROPIC_API_KEY to the API for real AI output.)',
      ].join('\n'),
    };
  }

  async generateInterviewPrep(ctx: AiContext): Promise<InterviewPrep> {
    return {
      questions: [
        'Tell me about yourself.',
        `Why do you want to work at ${ctx.company}?`,
        `What draws you to the ${ctx.role} role?`,
        'Describe a challenging project you worked on and what you learned.',
        'Tell me about a time you disagreed with a teammate.',
        'Where do you see yourself in two years?',
      ],
    };
  }

  async generateMatchScore(ctx: AiContext): Promise<MatchScore> {
    // Stable pseudo-score from the inputs so the UI shows something consistent.
    const seed = [...(ctx.company + ctx.role)].reduce((n, c) => n + c.charCodeAt(0), 0);
    return {
      score: 55 + (seed % 36),
      summary: `Sample result for ${ctx.role} at ${ctx.company}. Add ANTHROPIC_API_KEY to the API for a real analysis of your resume.`,
      strengths: ['Relevant technical background', 'Experience with similar products'],
      gaps: ['Sample gap: real analysis needs an API key'],
    };
  }
}
