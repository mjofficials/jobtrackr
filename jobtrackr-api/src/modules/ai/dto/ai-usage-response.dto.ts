import { ApiProperty } from '@nestjs/swagger';

export class AiUsageResponseDto {
  @ApiProperty()
  used: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  remaining: number;
}
