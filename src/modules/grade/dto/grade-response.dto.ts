import { Expose, plainToInstance } from 'class-transformer';
import { Attendance } from '@prisma/client';
import { Grade } from '../entities/grade.entity';

export class GradeResponseDto {
  @Expose()
  id: string;

  @Expose()
  internId: string;

  @Expose()
  courseId: string;

  @Expose()
  mentorId?: string;

  @Expose()
  s1?: Attendance;

  @Expose()
  s2?: Attendance;

  @Expose()
  s3?: Attendance;

  @Expose()
  s4?: Attendance;

  @Expose()
  s5?: Attendance;

  @Expose()
  s6?: Attendance;

  @Expose()
  initialCommitment?: number;

  @Expose()
  assertiveCommunication?: number;

  @Expose()
  punctuality?: number;

  @Expose()
  classParticipation?: number;

  @Expose()
  proactivity?: number;

  @Expose()
  communicationSkills?: number;

  @Expose()
  punctualityOfDelivery?: number;

  @Expose()
  redaction?: number;

  @Expose()
  performance?: number;

  @Expose()
  recommendation?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Grade): GradeResponseDto {
    return plainToInstance(GradeResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
