import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
export class CreateCourseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Type(() => Number)
  year: number;
}
