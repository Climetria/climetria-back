import {
  Company as CompanyModel,
  OrganizationSize,
  TopicCode,
} from '@prisma/client';

export class Company {
  constructor(
    public readonly id: string,
    public email: string,
    public contactName: string,
    public phone: string,
    public country: string,
    public organizationName: string,
    public organizationSize: OrganizationSize,
    public sector: string,
    public topicsOfInterest: TopicCode[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public ruc?: string,
  ) {}

  static fromPrisma(data: CompanyModel): Company {
    return new Company(
      data.id,
      data.email,
      data.contactName,
      data.phone,
      data.country,
      data.organizationName,
      data.organizationSize,
      data.sector,
      data.topicsOfInterest,
      data.createdAt,
      data.updatedAt,
      data.ruc ?? undefined,
    );
  }
}
