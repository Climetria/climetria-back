import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, PeruDepartment, TopicCode } from '@prisma/client';

export class CreateInternDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  document: string;

  @IsEmail()
  email: string;

  @IsString()
  firstNames: string;

  @IsString()
  lastNameFather: string;

  @IsString()
  lastNameMother: string;

  @IsString()
  phone: string;

  @IsString()
  universityName: string;

  @IsString()
  profession: string;

  @IsInt()
  @Type(() => Number)
  graduationYear: number;

  @IsString()
  referralSource: string;

  @IsArray()
  @IsEnum(TopicCode, { each: true })
  topicsOfInterest: TopicCode[];

  @IsString()
  country: string;

  @IsOptional()
  //@ValidateIf((o) => o.country?.toLowerCase() === 'peru')
  @IsEnum(PeruDepartment)
  peruDepartment?: PeruDepartment;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
