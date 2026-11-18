import { Body, Controller, Get, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extractResumeText, MAX_RESUME_BYTES } from './resume-parser';
import { ProfileService } from './profile.service';
import { GetUser } from 'src/common/auth/decorators/get-user.decorator';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update user profile' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Extract text from a resume PDF (does not save it)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_RESUME_BYTES, files: 1 } }))
  extractResume(@UploadedFile() file: Express.Multer.File) {
    return extractResumeText(file);
  }
}
