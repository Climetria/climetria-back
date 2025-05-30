import {
  Intern as InternModel,
  DocumentType,
  TopicCode,
  PeruDepartment,
} from '@prisma/client';

export class Intern {
  constructor(
    public readonly id: string,
    public email: string,
    public firstNames: string,
    public lastNameFather: string,
    public lastNameMother: string,
    public phone: string,
    public universityName: string,
    public profession: string,
    public graduationYear: number,
    public topicsOfInterest: TopicCode[],
    public country: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public documentType?: DocumentType,
    public document?: string,
    public peruDepartment?: PeruDepartment,
  ) {}

  static fromPrisma(data: InternModel): Intern {
    return new Intern(
      data.id,
      data.email,
      data.firstNames,
      data.lastNameFather,
      data.lastNameMother,
      data.phone,
      data.universityName,
      data.profession,
      data.graduationYear,
      data.topicsOfInterest,
      data.country,
      data.createdAt,
      data.updatedAt,
      data.documentType ?? undefined,
      data.document ?? undefined,
      data.peruDepartment ?? undefined,
    );
  }
}
