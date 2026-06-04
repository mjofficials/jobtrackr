import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  create(@Body() body: CreateApplicationDto, @Req() req: any) {
    return this.applicationsService.create(body, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.applicationsService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get application by id' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.applicationsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application by id' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateApplicationDto,
    @Req() req: any
  ) {
    return this.applicationsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete application' })
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.applicationsService.remove(id, req.user.userId);
  }
}
