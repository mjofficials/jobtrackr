import { ApiProperty } from '@nestjs/swagger';

export class MatchScoreResponseDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  score: number;

  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [String] })
  strengths: string[];

  @ApiProperty({ type: [String] })
  gaps: string[];
}
