import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new application' })
  create(@Body() body: CreateApplicationDto, @GetUser('id') userId: string) {
    return this.applicationsService.create(body, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser('id') userId: string) {
    return this.applicationsService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get application by id' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.applicationsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application by id' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @GetUser('id') userId: string
  ) {
    return this.applicationsService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete application' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.applicationsService.remove(id, userId);
  }
}
