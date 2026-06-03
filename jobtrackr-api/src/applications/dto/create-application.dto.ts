import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsEnum(Status)
  status?: Status;
}