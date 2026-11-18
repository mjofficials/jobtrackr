import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { AiContext, AiProvider, FollowUpEmail, InterviewPrep, MatchScore } from './ai-provider.interface';

const MODEL = 'claude-opus-5-5';

const SYSTEM = `You are a career coach inside JobTrackr, a job application tracker.
You help one job seeker with one specific application at a time.
Ground every answer in the details provided (resume, role, company, notes). Do not invent facts about the candidate's experience.
If something important is missing, work with what is there rather than asking questions.
Write in plain, professional English.`;

const FollowUpSchema = z.object({
  subject: z.string().describe('Email subject line, under 80 characters'),
  body: z.string().describe('Email body in plain text with line breaks, signed with the candidate name'),
});

const InterviewPrepSchema = z.object({
  questions: z.array(z.string()).describe('8 to 10 likely interview questions, most likely first'),
});

const MatchScoreSchema = z.object({
  score: z.number().int().describe('Fit between the resume and the role, 0 to 100'),
  summary: z.string().describe('Two or three sentences explaining the score'),
  strengths: z.array(z.string()).describe('Up to 4 concrete strengths for this role, from the resume'),
  gaps: z.array(z.string()).describe('Up to 4 concrete gaps or risks, with how to address each'),
});

/** Renders the application as a compact, labelled block for the prompt. */
function describe(ctx: AiContext, opts: { withResume: boolean }): string {
  const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
  const salary =
    ctx.salaryMin || ctx.salaryMax
      ? `${ctx.salaryMin ?? '?'} to ${ctx.salaryMax ?? '?'} ${ctx.currency} per year`
      : null;
  const lines: [string, string | null][] = [
    ['Candidate name', ctx.userName],
    ['Company', ctx.company],
    ['Role', ctx.role],
    ['Current stage', ctx.status],
    ['Found via', ctx.source],
    ['Job posting URL', ctx.jobUrl],
    ['Salary range', salary],
    ['Applied on', fmt(ctx.appliedDate)],
    ['Follow-up planned for', fmt(ctx.followupDate)],
    ['Candidate notes', ctx.notes],
  ];
  const app = lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  const resume = opts.withResume && ctx.resumeText ? `\n\n<resume>\n${ctx.resumeText}\n</resume>` : '';
  return `<application>\n${app}\n</application>${resume}`;
}

@Injectable()
export class ClaudeAiProvider implements AiProvider {
  private readonly logger = new Logger(ClaudeAiProvider.name);

  constructor(private readonly client: Anthropic) {}

  async generateFollowUpEmail(ctx: AiContext): Promise<FollowUpEmail> {
    return this.ask(
      FollowUpSchema,
      `${describe(ctx, { withResume: true })}

Write a short follow-up email (under 150 words) the candidate can send to the recruiter or hiring team about this application.
Match the tone to the current stage. If the notes mention a person or a detail from a conversation, use it. Mention one specific, relevant strength from the resume if there is one.`
    );
  }

  async generateInterviewPrep(ctx: AiContext): Promise<InterviewPrep> {
    return this.ask(
      InterviewPrepSchema,
      `${describe(ctx, { withResume: true })}

List the questions this candidate is most likely to be asked when interviewing for this role at this company.
Mix role-specific technical questions, behavioural questions, and questions that probe gaps between the resume and the role. Each question is one sentence.`
    );
  }

  async generateMatchScore(ctx: AiContext): Promise<MatchScore> {
    const result = await this.ask(
      MatchScoreSchema,
      `${describe(ctx, { withResume: true })}

Assess how well this candidate's resume fits the role. Base the score on the role title, company and any notes about the job.
Be honest: a mediocre fit should score in the 40s-60s.`
    );
    return { ...result, score: Math.max(0, Math.min(100, Math.round(result.score))) };
  }

  /** One structured-output call. Refusals fall back server-side to another model. */
  private async ask<T extends z.ZodType>(schema: T, prompt: string): Promise<z.infer<T>> {
    try {
      const response = await this.client.beta.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        output_config: { effort: 'medium', format: betaZodOutputFormat(schema) },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.stop_reason === 'refusal') {
        throw new ServiceUnavailableException('The AI declined this request. Try rephrasing your notes.');
      }
      if (!response.parsed_output) {
        this.logger.warn(`Unparseable AI output (stop_reason=${response.stop_reason})`);
        throw new ServiceUnavailableException('The AI returned an unexpected answer. Try again.');
      }
      return response.parsed_output as z.infer<T>;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      if (error instanceof Anthropic.AuthenticationError) {
        this.logger.error('Anthropic rejected the API key');
        throw new ServiceUnavailableException('AI is not configured correctly on the server.');
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException('The AI service is busy. Try again in a minute.');
      }
      if (error instanceof Anthropic.APIError) {
        this.logger.error(`Anthropic API error ${error.status}: ${error.message}`);
        throw new ServiceUnavailableException('The AI service is unavailable right now. Try again shortly.');
      }
      throw error;
    }
  }
}
