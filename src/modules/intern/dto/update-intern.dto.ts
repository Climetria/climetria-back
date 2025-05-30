import { IsOptional, IsString } from 'class-validator';

export class UpdateInternDto {
  @IsOptional()
  @IsString()
  firstNames?: string;
}
