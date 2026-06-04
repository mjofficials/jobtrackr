import { Status } from '@prisma/client';

export class ApplicationResponseDto {
  id: string;
  company: string;
  role: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
