import { ApiProperty } from '@nestjs/swagger';
import { AILogType } from '@prisma/client';

export class AILogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AILogType })
  type: AILogType;

  @ApiProperty()
  createdAt: Date;
}
