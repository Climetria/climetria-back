import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GenderSelection,
  Major,
  OrganizationSize,
  PeruDepartment,
  TopicCode,
} from '@prisma/client';

export class CreateOrganizationDto {
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
}

export class CreateOrganizationFilterDto {
  @IsInt()
  @Type(() => Number)
  maximumNumberOfInterns: number;

  @IsEnum(PeruDepartment)
  placeOfResidenceFilter: PeruDepartment;

  @IsArray()
  @IsEnum(Major, { each: true })
  studiedMajorFilter: Major[];

  @IsEnum(GenderSelection)
  genderFilter: GenderSelection;

  @IsOptional()
  @IsString()
  extraRequirements: string;
}
