import { Expose, plainToInstance } from 'class-transformer';
import { OrganizationSize, TopicCode } from '@prisma/client';
import { Company } from '../entities/company.entity';

export class CompanyResponseDto {
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
  courseId?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;

  static fromEntity(entity: Company): CompanyResponseDto {
    return plainToInstance(CompanyResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
