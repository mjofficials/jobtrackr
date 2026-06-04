import { Injectable, NotFoundException } from '@nestjs/common';
import { AILogType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

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
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const email = `
        Dear Hiring Team,

        I hope you're doing well.

        I wanted to follow up regarding my application for the ${application.role} position at ${application.company}.

        I remain very interested in the opportunity and would appreciate any updates regarding the hiring process.

        Thank you for your time and consideration.

        Best regards
    `;

    await this.prisma.aILog.create({
      data: {
        userId,
        applicationId,
        type: AILogType.FOLLOW_UP_EMAIL,
        input: JSON.stringify({
          company: application.company,
          role: application.role,
        }),
        output: email,
      },
    });

    return {
      email,
    };
  }

  async generateInterviewPrep(userId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const questions = [
      `Tell me about yourself.`,
      `Why do you want to work at ${application.company}?`,
      `Why are you interested in the ${application.role} position?`,
      `Describe a challenging project you've worked on.`,
      `What are your strengths and weaknesses?`,
      `Why should we hire you?`,
    ];

    await this.prisma.aILog.create({
      data: {
        userId,
        applicationId,
        type: AILogType.INTERVIEW_PREP,
        input: JSON.stringify({
          company: application.company,
          role: application.role,
        }),
        output: JSON.stringify(questions),
      },
    });

    return {
      questions,
    };
  }

  async generateMatchScore(userId: string, applicationId: string) {
    const [user, application] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          resumeText: true,
        },
      }),

      this.prisma.application.findFirst({
        where: {
          id: applicationId,
          userId,
        },
      }),
    ]);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    let score = 40;

    if (user?.resumeText) {
      score += 20;
    }

    if (application.notes) {
      score += 10;
    }

    if (application.jobUrl) {
      score += 10;
    }

    if (application.salaryMin) {
      score += 10;
    }

    if (application.salaryMax) {
      score += 10;
    }

    score = Math.min(score, 100);

    let summary = '';

    if (score >= 80) {
      summary = 'Strong match based on available profile and application information.';
    } else if (score >= 60) {
      summary = 'Moderate match with some relevant information available.';
    } else {
      summary = 'Limited information available to determine job compatibility.';
    }

    await this.prisma.aILog.create({
      data: {
        userId,
        applicationId,
        type: AILogType.MATCH_SCORE,
        input: JSON.stringify({
          hasResume: !!user?.resumeText,
          company: application.company,
          role: application.role,
        }),
        output: JSON.stringify({
          score,
          summary,
        }),
      },
    });

    return {
      score,
      summary,
    };
  }
}
