import { Injectable, NotFoundException } from '@nestjs/common';
import { AILogType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { AI_DAILY_LIMIT } from './constants/ai.constants';
import { MockAiProvider } from './providers/mock-ai.provider';

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
    private readonly aiProvider: MockAiProvider
  ) {}

  async findAll(userId: string) {
    return this.prisma.aILog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const log = await this.prisma.aILog.findFirst({
      where: { id, userId },
      select: {
        id: true,
        type: true,
        input: true,
        output: true,
        createdAt: true,
      },
    });

    if (!log) {
      throw new NotFoundException('AI log not found');
    }
    return log;
  }

  async generateFollowUpEmail(userId: string, applicationId: string) {
    await this.validateAiUsage(userId);

    const application = await this.findOwnedApplication(userId, applicationId);

    const email = await this.aiProvider.generateFollowUpEmail(
      application.company,
      application.role
    );

    await this.createAiLog({
      type: AILogType.FOLLOW_UP_EMAIL,
      userId,
      applicationId,
      input: JSON.stringify({
        company: application.company,
        role: application.role,
      }),
      output: email,
    });

    await this.incrementAiUsage(userId);

    return {
      email,
    };
  }

  async generateInterviewPrep(userId: string, applicationId: string) {
    await this.validateAiUsage(userId);

    const application = await this.findOwnedApplication(userId, applicationId);

    const questions = await this.aiProvider.generateInterviewPrep(
      application.company,
      application.role
    );

    await this.createAiLog({
      type: AILogType.INTERVIEW_PREP,
      userId,
      applicationId,
      input: JSON.stringify({
        company: application.company,
        role: application.role,
      }),
      output: JSON.stringify(questions),
    });

    await this.incrementAiUsage(userId);

    return {
      questions,
    };
  }

  async generateMatchScore(userId: string, applicationId: string) {
    await this.validateAiUsage(userId);

    const [user, application] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          resumeText: true,
        },
      }),

      this.findOwnedApplication(userId, applicationId),
    ]);

    const result = await this.aiProvider.generateMatchScore({
      resumeText: user?.resumeText,
      company: application.company,
      role: application.role,
      notes: application.notes,
      jobUrl: application.jobUrl,
      salaryMin: application.salaryMin,
      salaryMax: application.salaryMax,
    });

    await this.createAiLog({
      type: AILogType.MATCH_SCORE,
      applicationId,
      userId,
      input: JSON.stringify({
        hasResume: !!user?.resumeText,
        company: application.company,
        role: application.role,
      }),
      output: JSON.stringify({
        score: result.score,
        summary: result.summary,
      }),
    });

    await this.incrementAiUsage(userId);

    return result;
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
