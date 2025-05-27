import { IsOptional, IsString } from 'class-validator';

export class UpdateMentorDto {
  @IsOptional()
  @IsString()
  name?: string;
}
