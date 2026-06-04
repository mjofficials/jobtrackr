import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
}
