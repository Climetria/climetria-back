import { Expose, plainToInstance } from 'class-transformer';
import { OrgCertificate } from '../entities/orgCertificate.entity';

export class OrgCertificateResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  signerFullName?: string;

  @Expose()
  signerTitle?: string;

  @Expose()
  signerSignatureUrl?: string;

  @Expose()
  courseIds?: string[];

  @Expose()
  courseStatus: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;

  static fromEntity(entity: OrgCertificate): OrgCertificateResponseDto {
    return plainToInstance(OrgCertificateResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
