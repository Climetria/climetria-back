import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { OrganizationSize, TopicCode } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @Length(11, 11)
  @Matches(/^\d{11}$/)
  ruc: string;

  @IsEmail()
  email: string;

  @IsString()
  contactName: string;

  @IsString()
  phone: string;

  @IsString()
  country: string;

  @IsString()
  organizationName: string;

  @IsEnum(OrganizationSize)
  organizationSize: OrganizationSize;

  @IsString()
  sector: string;

  @IsArray()
  @IsEnum(TopicCode, { each: true })
  topicsOfInterest: TopicCode[];

  @IsOptional()
  @IsString()
  courseId?: string;
}
