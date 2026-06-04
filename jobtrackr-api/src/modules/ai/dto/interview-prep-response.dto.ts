import { ApiProperty } from '@nestjs/swagger';

export class InterviewPrepResponseDto {
  @ApiProperty({ type: [String] })
  questions: string[];
}
