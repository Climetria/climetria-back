import {
  Mentor as MentorModel,
  DocumentType,
  PeruDepartment,
} from '@prisma/client';

export class Mentor {
  constructor(
    public readonly id: string,
    public documentType: DocumentType,
    public document: string,
    public email: string,
    public firstNames: string,
    public lastNameFather: string,
    public lastNameMother: string,
    public phone: string,
    public country: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public peruDepartment?: PeruDepartment,
    public courseId?: string,
    public deletedAt?: Date,
  ) {}

  static fromPrisma(data: MentorModel): Mentor {
    return new Mentor(
      data.id,
      data.documentType,
      data.document,
      data.email,
      data.firstNames,
      data.lastNameFather,
      data.lastNameMother,
      data.phone,
      data.country,
      data.createdAt,
      data.updatedAt,
      data.peruDepartment ?? undefined,
      data.courseId ?? undefined,
      data.deletedAt ?? undefined,
    );
  }
}
