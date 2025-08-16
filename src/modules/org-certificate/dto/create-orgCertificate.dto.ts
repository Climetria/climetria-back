import { IsOptional, IsString } from 'class-validator';

export class CreateOrgCertificateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  signerFullName?: string;

  @IsOptional()
  @IsString()
  signerTitle?: string;
}
