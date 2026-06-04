import { ApiProperty } from '@nestjs/swagger';
import { AILogType } from '@prisma/client';

export class AILogDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AILogType })
  type: AILogType;

  @ApiProperty()
  input: string;

  @ApiProperty()
  output: string;

  @ApiProperty()
  createdAt: Date;
}
