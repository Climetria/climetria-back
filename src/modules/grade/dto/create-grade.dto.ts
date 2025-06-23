import { IsUUID } from 'class-validator';

export class CreateGradeDto {
  @IsUUID()
  internId: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  mentorId: string;
}
