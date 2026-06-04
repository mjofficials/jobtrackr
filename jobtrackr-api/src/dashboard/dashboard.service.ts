import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(userId: string) {
    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      where: {
        userId,
      },
      _count: {
        status: true,
      },
    });

    const summary = {
      totalApplications: 0,
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    grouped.forEach((item) => {
      const count = item._count.status;

      summary.totalApplications += count;

      switch (item.status) {
        case 'SAVED':
          summary.saved = count;
          break;

        case 'APPLIED':
          summary.applied = count;
          break;

        case 'INTERVIEW':
          summary.interview = count;
          break;

        case 'OFFER':
          summary.offer = count;
          break;

        case 'REJECTED':
          summary.rejected = count;
          break;
      }
    });

    return summary;
  }

  async getRecentApplications(userId: string, limit: number) {
    return this.prisma.application.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async getActivity(userId: string) {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [applicationsThisMonth, applicationsLastMonth, interviews, offers, rejections] =
      await Promise.all([
        this.prisma.application.count({
          where: {
            userId,
            createdAt: {
              gte: startOfCurrentMonth,
            },
          },
        }),

        this.prisma.application.count({
          where: {
            userId,
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),

        this.prisma.application.count({
          where: {
            userId,
            status: Status.INTERVIEW,
          },
        }),

        this.prisma.application.count({
          where: {
            userId,
            status: Status.OFFER,
          },
        }),

        this.prisma.application.count({
          where: {
            userId,
            status: Status.REJECTED,
          },
        }),
      ]);

    return {
      applicationsThisMonth,
      applicationsLastMonth,
      interviews,
      offers,
      rejections,
    };
  }
}
