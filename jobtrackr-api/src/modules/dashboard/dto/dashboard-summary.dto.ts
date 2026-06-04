import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  applied: number;

  @ApiProperty()
  interview: number;

  @ApiProperty()
  offer: number;

  @ApiProperty()
  rejected: number;
}
