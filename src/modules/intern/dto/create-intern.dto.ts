import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, PeruDepartment, TopicCode } from '@prisma/client';

export class CreateInternDto {
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  document?: string;

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

  @ValidateIf((o) => o.country?.toLowerCase() === 'peru')
  @IsEnum(PeruDepartment)
  peruDepartment?: PeruDepartment;
}
