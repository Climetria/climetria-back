import {
  OrganizationCertificateCourse,
  OrganizationCertificate as OrgCertificateModel,
} from '@prisma/client';

export class OrgCertificate {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public logoUrl?: string,
    public signerFullName?: string,
    public signerTitle?: string,
    public signerSignatureUrl?: string,
    public courseIds?: string[],
    public deletedAt?: Date,
  ) {}

  get courseStatus(): string {
    return this.courseIds && this.courseIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  static fromPrisma(
    data: OrgCertificateModel & {
      orgCertificateCourses?: OrganizationCertificateCourse[];
    },
  ): OrgCertificate {
    return new OrgCertificate(
      data.id,
      data.name,
      data.createdAt,
      data.updatedAt,
      data.logoUrl ?? undefined,
      data.signerFullName ?? undefined,
      data.signerTitle ?? undefined,
      data.signerSignatureUrl ?? undefined,
      data.orgCertificateCourses?.map((occ) => occ.courseId),
      data.deletedAt ?? undefined,
    );
  }
}
