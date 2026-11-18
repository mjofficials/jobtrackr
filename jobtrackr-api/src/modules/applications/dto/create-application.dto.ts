import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, Length, Min } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  company: string;

  @ApiProperty()
  @IsString()
  @Length(1, 120)
  role: string;

  @ApiPropertyOptional({ enum: Status, default: Status.SAVED })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ example: 'LinkedIn' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followupDate?: string;
}
