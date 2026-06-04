import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplicationAiRequestDto {
  @ApiProperty()
  @IsString()
  applicationId: string;
}
