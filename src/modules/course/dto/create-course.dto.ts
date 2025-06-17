import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateCourseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Type(() => Number)
  year: number;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mentorIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  organizationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  internIds?: string[];
}
