import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, userId: string) {
    const application = await this.prisma.application.create({
      data: {
        company: dto.company,
        role: dto.role,
        status: dto.status,
        userId,
      },
    });

    return application;
  }

  async findAll(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      count: applications.length,
      data: applications,
    };
  }

  async findOne(id: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, dto: UpdateApplicationDto, userId: string) {
    const application = await this.findApplicationByIdAndUser(id, userId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const application = await this.findApplicationByIdAndUser(id, userId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    return {
      message: 'Application deleted successfully',
    };
  }

  private async findApplicationByIdAndUser(id: string, userId: string) {
    return this.prisma.application.findFirst({
      where: { id, userId },
    });
  }
}
