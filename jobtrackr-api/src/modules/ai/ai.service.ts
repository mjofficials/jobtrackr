import { Injectable, NotFoundException } from '@nestjs/common';
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
}
