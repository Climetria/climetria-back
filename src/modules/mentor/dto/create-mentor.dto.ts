import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DocumentType, PeruDepartment } from '@prisma/client';

export class CreateMentorDto {
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
  country: string;

  @IsOptional()
  //@ValidateIf((o) => o.country?.toLowerCase() === 'peru')
  @IsEnum(PeruDepartment)
  peruDepartment?: PeruDepartment;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  courseIds?: string[];
}
