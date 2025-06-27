import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Attendance } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGradeDtoBase {
  @IsOptional()
  @IsEnum(Attendance)
  s1?: Attendance;

  @IsOptional()
  @IsEnum(Attendance)
  s2?: Attendance;

  @IsOptional()
  @IsEnum(Attendance)
  s3?: Attendance;

  @IsOptional()
  @IsEnum(Attendance)
  s4?: Attendance;

  @IsOptional()
  @IsEnum(Attendance)
  s5?: Attendance;

  @IsOptional()
  @IsEnum(Attendance)
  s6?: Attendance;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  initialCommitment?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  assertiveCommunication?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  punctuality?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  classParticipation?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  proactivity?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  punctualityOfDelivery?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  redaction?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  performance?: number;

  @IsOptional()
  @IsString()
  recommendation?: string;
}

export class UpdateGradeDto extends PartialType(UpdateGradeDtoBase) {}
