import { ApiProperty } from '@nestjs/swagger';

export class DashboardActivityDto {
  @ApiProperty()
  applicationsThisMonth: number;

  @ApiProperty()
  applicationsLastMonth: number;

  @ApiProperty()
  interviews: number;

  @ApiProperty()
  offers: number;

  @ApiProperty()
  rejections: number;
}
