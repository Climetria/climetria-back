import { IsDate, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInternDto {
  @IsString()
  name: string;
  @IsString()
  lastName: string;
  @IsString()
  document: string;
  @IsString()
  gender: string;
  @Transform(({ value }) => new Date(value))
  @IsDate()
  birthdate: Date;
}
