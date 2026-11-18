import { ApiProperty } from '@nestjs/swagger';

export class FollowUpEmailResponseDto {
  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;
}
