import { Expose, plainToInstance } from 'class-transformer';
import { Intern } from '../entities/intern.entity';
import { DocumentType, PeruDepartment, TopicCode } from '@prisma/client';

export class InternResponseDto {
  @Expose()
  id: string;

  @Expose()
  documentType?: DocumentType;

  @Expose()
  document?: string;

  @Expose()
  email: string;

  @Expose()
  firstNames: string;

  @Expose()
  lastNameFather: string;

  @Expose()
  lastNameMother: string;

  @Expose()
  phone: string;

  @Expose()
  universityName: string;

  @Expose()
  profession: string;

  @Expose()
  graduationYear: number;

  @Expose()
  topicsOfInterest: TopicCode[];

  @Expose()
  country: string;

  @Expose()
  peruDepartment?: PeruDepartment;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Intern): InternResponseDto {
    return plainToInstance(InternResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
