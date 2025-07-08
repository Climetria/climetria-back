import { Expose, plainToInstance } from 'class-transformer';
import {
  GenderSelection,
  Major,
  OrganizationSize,
  PeruDepartment,
  TopicCode,
} from '@prisma/client';
import { Organization } from '../entities/organization.entity';
import { OrganizationFilter } from '../entities/organization-filter.entity';

export class OrganizationResponseDto {
  @Expose()
  id: string;

  @Expose()
  ruc: string;

  @Expose()
  email: string;

  @Expose()
  contactName: string;

  @Expose()
  phone: string;

  @Expose()
  country: string;

  @Expose()
  organizationName: string;

  @Expose()
  organizationSize: OrganizationSize;

  @Expose()
  sector: string;

  @Expose()
  topicsOfInterest: TopicCode[];

  @Expose()
  courseIds?: string[];

  @Expose()
  courseStatus: string;

  @Expose()
  mentorIds?: string[];

  @Expose()
  mentorStatus: string;

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

  static fromEntity(entity: Organization): OrganizationResponseDto {
    return plainToInstance(OrganizationResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}

export class OrganizationFilterResponseDto {
  @Expose()
  id: string;

  @Expose()
  courseId: string;

  @Expose()
  organizationId: string;

  @Expose()
  maximumNumberOfInterns: number;

  @Expose()
  placeOfResidenceFilter: PeruDepartment;

  @Expose()
  studiedMajorFilter: Major[];

  @Expose()
  genderFilter: GenderSelection;

  @Expose()
  extraRequirements: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: OrganizationFilter): OrganizationFilterResponseDto {
    return plainToInstance(OrganizationFilterResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
