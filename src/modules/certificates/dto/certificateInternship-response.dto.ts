import { Expose } from 'class-transformer';

export class CertificateInternshipResponseDto {
  @Expose()
  fullName: string;

  @Expose()
  course: string;

  @Expose()
  organization: string;
}
