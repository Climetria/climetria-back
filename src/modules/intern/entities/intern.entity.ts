import {
  Intern as InternModel,
  DocumentType,
  TopicCode,
  PeruDepartment,
  InternCourse,
  InternAssignment,
} from '@prisma/client';

export class Intern {
  constructor(
    public readonly id: string,
    public documentType: DocumentType,
    public document: string,
    public email: string,
    public firstNames: string,
    public lastNameFather: string,
    public lastNameMother: string,
    public phone: string,
    public universityName: string,
    public profession: string,
    public graduationYear: number,
    public referralSource,
    public topicsOfInterest: TopicCode[],
    public country: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public peruDepartment?: PeruDepartment,
    public courseIds?: string[],
    public organizationIds?: string[],
    public deletedAt?: Date,
  ) {}

  get courseStatus(): string {
    return this.courseIds && this.courseIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  get organizationStatus(): string {
    return this.organizationIds && this.organizationIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  static fromPrisma(
    data: InternModel & { internCourses?: InternCourse[] } & {
      internAssignments?: InternAssignment[];
    },
  ): Intern {
    return new Intern(
      data.id,
      data.documentType,
      data.document,
      data.email,
      data.firstNames,
      data.lastNameFather,
      data.lastNameMother,
      data.phone,
      data.universityName,
      data.profession,
      data.graduationYear,
      data.referralSource,
      data.topicsOfInterest,
      data.country,
      data.createdAt,
      data.updatedAt,
      data.peruDepartment ?? undefined,
      data.internCourses?.map((ic) => ic.courseId),
      data.internAssignments?.map((ia) => ia.organizationId),
      data.deletedAt ?? undefined,
    );
  }
}
