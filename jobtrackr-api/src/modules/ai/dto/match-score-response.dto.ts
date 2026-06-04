import { ApiProperty } from '@nestjs/swagger';

export class MatchScoreResponseDto {
  @ApiProperty()
  score: number;

  @ApiProperty()
  summary: string;
}
