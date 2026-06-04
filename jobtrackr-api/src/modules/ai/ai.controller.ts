import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GetUser } from 'src/common/auth/decorators/get-user.decorator';
import { FollowUpEmailResponseDto } from './dto/follow-up-email-response.dto';
import { ApplicationAiRequestDto } from './dto/application-ai-request.dto';
import { InterviewPrepResponseDto } from './dto/interview-prep-response.dto';
import { MatchScoreResponseDto } from './dto/match-score-response.dto';
import { AiUsageResponseDto } from './dto/ai-usage-response.dto';

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
  @ApiOperation({ summary: 'Get single log by id' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.aiService.findOne(id, userId);
  }

  @Post('follow-up-email')
  @ApiOperation({ summary: 'Generate follow-up email' })
  @ApiOkResponse({ type: FollowUpEmailResponseDto })
  generateFollowUpEmail(@GetUser('id') userId: string, @Body() dto: ApplicationAiRequestDto) {
    return this.aiService.generateFollowUpEmail(userId, dto.applicationId);
  }

  @Post('interview-prep')
  @ApiOperation({ summary: 'Generate interview preparation questions' })
  @ApiOkResponse({ type: InterviewPrepResponseDto })
  generateInterviewPrep(@GetUser('id') userId: string, @Body() dto: ApplicationAiRequestDto) {
    return this.aiService.generateInterviewPrep(userId, dto.applicationId);
  }

  @Post('match-score')
  @ApiOperation({ summary: 'Generate match score' })
  @ApiOkResponse({ type: MatchScoreResponseDto })
  generateMatchScore(@GetUser('id') userId: string, @Body() dto: ApplicationAiRequestDto) {
    return this.aiService.generateMatchScore(userId, dto.applicationId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage' })
  @ApiOkResponse({ type: AiUsageResponseDto })
  getUsage(@GetUser('id') userId: string) {
    return this.aiService.getUsage(userId);
  }
}
