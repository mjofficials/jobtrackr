import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GetUser } from 'src/common/auth/decorators/get-user.decorator';

!ApiTags('AI');
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs' })
  findAll(@GetUser('id') userId: string) {
    return this.aiService.findAll(userId);
  }

  @Get('logs/:id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.aiService.findOne(id, userId);
  }
}
