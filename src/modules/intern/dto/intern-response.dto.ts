import { Expose, plainToInstance } from 'class-transformer';
import { Intern } from '../entities/intern.entity';
import {
  DocumentType,
  Gender,
  Major,
  PeruDepartment,
  TopicCode,
} from '@prisma/client';

export class InternResponseDto {
  @Expose()
  id: string;

  @Expose()
  documentType: DocumentType;

  @Expose()
  document: string;

  @Expose()
  email: string;

  @Expose()
  firstNames: string;

  @Expose()
  lastNameFather: string;

  @Expose()
  lastNameMother: string;

  @Expose()
  gender: Gender;

  @Expose()
  phone: string;

  @Expose()
  universityName: string;

  @Expose()
  majorInProgress: Major;

  @Expose()
  profession: string;

  @Expose()
  graduationYear: number;

  @Expose()
  referralSource: string;

  @Expose()
  topicsOfInterest: TopicCode[];

  @Expose()
  country: string;

  @Expose()
  peruDepartment?: PeruDepartment;

  @Expose()
  courseIds?: string[];

  @Expose()
  courseStatus: string;

  @Expose()
  organizationIds?: string[];

  @Expose()
  organizationStatus: string;

  @Expose()
  gradeIds?: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;

  static fromEntity(entity: Intern): InternResponseDto {
    return plainToInstance(InternResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
