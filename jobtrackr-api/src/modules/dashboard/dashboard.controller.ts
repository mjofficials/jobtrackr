import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/auth/decorators/get-user.decorator';
import { DashboardService } from './dashboard.service';
import { RecentApplicationDto } from './dto/recent-application.dto';
import { DashboardActivityDto } from './dto/dashboard-activity.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  getSummary(@GetUser('id') userId: string) {
    return this.dashboardService.getDashboardSummary(userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent applications' })
  @ApiOkResponse({ type: RecentApplicationDto, isArray: true })
  getRecentApplications(@GetUser('id') userId: string, @Query('limit') limit = 5) {
    return this.dashboardService.getRecentApplications(userId, Number(limit));
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get dashboard activity metrics' })
  @ApiOkResponse({ type: DashboardActivityDto })
  getActivity(@GetUser('id') userId: string) {
    return this.dashboardService.getActivity(userId);
  }
}
