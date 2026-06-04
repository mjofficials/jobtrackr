import { ApiProperty } from '@nestjs/swagger';

export class FollowUpEmailResponseDto {
  @ApiProperty()
  email: string;
}
