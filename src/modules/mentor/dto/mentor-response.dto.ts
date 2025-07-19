import { Expose, plainToInstance } from 'class-transformer';
import { Mentor } from '../entities/mentor.entity';
import { DocumentType, PeruDepartment } from '@prisma/client';

export class MentorResponseDto {
  @Expose()
  id: string;

  @Expose()
  documentType: DocumentType;

  @Expose()
  document: string;

  @Expose()
  email: string;

  @Expose()
  cognitoUser: string;

  @Expose()
  firstNames: string;

  @Expose()
  lastNameFather: string;

  @Expose()
  lastNameMother: string;

  @Expose()
  phone: string;

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

  static fromEntity(entity: Mentor): MentorResponseDto {
    return plainToInstance(MentorResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
