import { Expose, plainToInstance } from 'class-transformer';
import { Course } from '../entities/course.entity';

export class CourseResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  year: number;

  @Expose()
  mentorIds?: string[];

  @Expose()
  mentorStatus: string;

  @Expose()
  organizationIds?: string[];

  @Expose()
  organizationStatus: string;

  @Expose()
  internIds?: string[];

  @Expose()
  internStatus: string;

  @Expose()
  gradeIds?: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;

  static fromEntity(entity: Course): CourseResponseDto {
    return plainToInstance(CourseResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
