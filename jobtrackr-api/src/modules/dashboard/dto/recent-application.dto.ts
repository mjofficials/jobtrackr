import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class RecentApplicationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ enum: Status })
  status: Status;

  @ApiProperty()
  updatedAt: Date;
}
