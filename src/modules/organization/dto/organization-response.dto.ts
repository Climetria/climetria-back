import { Expose, plainToInstance } from 'class-transformer';
import { OrganizationSize, TopicCode } from '@prisma/client';
import { Organization } from '../entities/organization.entity';

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
