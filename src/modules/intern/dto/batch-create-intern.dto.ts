import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  DocumentType,
  Gender,
  Major,
  PeruDepartment,
  TopicCode,
} from '@prisma/client';

export class BatchCreateInternDto {
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

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  phone: string;

  @IsString()
  universityName: string;

  @IsEnum(Major)
  majorInProgress: Major;

  @IsString()
  profession: string;

  @IsInt()
  @Type(() => Number)
  graduationYear: number;

  @IsString()
  referralSource: string;

  @Transform(({ value }): TopicCode[] => {
    if (typeof value === 'string') {
      return value.split(/[,;]+/).map((s) => s.trim()) as TopicCode[];
    }
    if (Array.isArray(value)) {
      return value as TopicCode[];
    }
    return [];
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(TopicCode, { each: true })
  topicsOfInterest: TopicCode[];

  @IsString()
  country: string;

  @IsOptional()
  @ValidateIf((o: BatchCreateInternDto) => o.country?.toLowerCase() === 'peru')
  @IsEnum(PeruDepartment)
  peruDepartment?: PeruDepartment;
}
