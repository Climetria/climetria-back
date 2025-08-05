import { Expose } from 'class-transformer';

export class CertificateInternshipResponseDto {
  @Expose()
  fullName: string;

  @Expose()
  course: string;

  @Expose()
  organization: string;

  @Expose()
  logoUrl: string;

  @Expose()
  signerFullName: string;

  @Expose()
  signerTitle: string;

  @Expose()
  signerSignatureUrl: string;
}

export class CertificateCourseResponseDto {
  @Expose()
  fullName: string;

  @Expose()
  course: string;

  @Expose()
  hoursPerCourse: string;

  @Expose()
  organization: string;

  @Expose()
  logoUrl: string;

  @Expose()
  signerFullName: string;

  @Expose()
  signerTitle: string;

  @Expose()
  signerSignatureUrl: string;
}
