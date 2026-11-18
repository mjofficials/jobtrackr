import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AILogType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { AI_DAILY_LIMIT } from './constants/ai.constants';
import { AI_PROVIDER } from './providers/ai-provider.interface';
import type { AiContext, AiProvider } from './providers/ai-provider.interface';

type CreateAiLogInput = {
  type: AILogType;
  userId: string;
  applicationId: string;
  input: string;
  output: string;
};

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider
  ) {}

  /** AI history, newest first. With applicationId: that application's results, outputs included. */
  async findAll(userId: string, applicationId?: string) {
    const logs = await this.prisma.aILog.findMany({
      where: { userId, ...(applicationId ? { applicationId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: applicationId ? 30 : 100,
      select: { id: true, type: true, applicationId: true, createdAt: true, output: !!applicationId },
    });
    return logs.map(({ output, ...log }) => (output === undefined ? log : { ...log, result: this.parseOutput(output) }));
  }

  async findOne(id: string, userId: string) {
    const log = await this.prisma.aILog.findFirst({
      where: { id, userId },
      select: { id: true, type: true, applicationId: true, input: true, output: true, createdAt: true },
    });
    if (!log) {
      throw new NotFoundException('AI log not found');
    }
    return { ...log, result: this.parseOutput(log.output) };
  }

  generateFollowUpEmail(userId: string, applicationId: string) {
    return this.run(userId, applicationId, AILogType.FOLLOW_UP_EMAIL, (ctx) =>
      this.aiProvider.generateFollowUpEmail(ctx)
    );
  }

  generateInterviewPrep(userId: string, applicationId: string) {
    return this.run(userId, applicationId, AILogType.INTERVIEW_PREP, (ctx) =>
      this.aiProvider.generateInterviewPrep(ctx)
    );
  }

  generateMatchScore(userId: string, applicationId: string) {
    return this.run(userId, applicationId, AILogType.MATCH_SCORE, (ctx) => {
      if (!ctx.resumeText?.trim()) {
        throw new BadRequestException('Add your resume on the Profile page to get a match score.');
      }
      return this.aiProvider.generateMatchScore(ctx);
    });
  }

  /**
   * Shared flow for every AI feature: check the daily limit, build context,
   * call the provider, log the result, and only then count the call, so a
   * failed AI request never uses up the user's quota.
   */
  private async run<T extends object>(
    userId: string,
    applicationId: string,
    type: AILogType,
    generate: (ctx: AiContext) => Promise<T>
  ): Promise<T> {
    await this.validateAiUsage(userId);
    const [user, app] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, resumeText: true } }),
      this.findOwnedApplication(userId, applicationId),
    ]);

    const ctx: AiContext = {
      userName: user.name,
      resumeText: user.resumeText,
      company: app.company,
      role: app.role,
      status: app.status,
      source: app.source,
      jobUrl: app.jobUrl,
      notes: app.notes,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      currency: app.currency,
      appliedDate: app.appliedDate,
      followupDate: app.followupDate,
    };

    const result = await generate(ctx);

    await this.createAiLog({
      type,
      userId,
      applicationId,
      // Small summary of what was sent; the resume itself isn't duplicated into logs.
      input: JSON.stringify({ company: app.company, role: app.role, status: app.status, hasResume: !!user.resumeText }),
      output: JSON.stringify(result),
    });
    await this.incrementAiUsage(userId);
    return result;
  }

  /** Logs written before Phase 3 stored plain text; newer ones store JSON. */
  private parseOutput(output: string): unknown {
    try {
      return JSON.parse(output);
    } catch {
      return { text: output };
    }
  }

  //   Helper methods
  private async findOwnedApplication(userId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private async createAiLog(data: CreateAiLogInput) {
    return this.prisma.aILog.create({ data });
  }

  private async validateAiUsage(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        aiCallsToday: true,
        aiCallsResetAt: true,
      },
    });

    const now = new Date();

    const shouldReset =
      user.aiCallsResetAt.getDate() !== now.getDate() ||
      user.aiCallsResetAt.getMonth() !== now.getMonth() ||
      user.aiCallsResetAt.getFullYear() !== now.getFullYear();

    if (shouldReset) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          aiCallsToday: 0,
          aiCallsResetAt: now,
        },
      });

      return;
    }

    if (user.aiCallsToday >= AI_DAILY_LIMIT) {
      throw new ForbiddenException('Daily AI limit reached');
    }
  }

  private async incrementAiUsage(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        aiCallsToday: {
          increment: 1,
        },
      },
    });
  }

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        aiCallsToday: true,
      },
    });

    return {
      used: user.aiCallsToday,
      limit: AI_DAILY_LIMIT,
      remaining: AI_DAILY_LIMIT - user.aiCallsToday,
    };
  }
}
