import {
  Mentor as MentorModel,
  DocumentType,
  PeruDepartment,
  MentorCourse,
  MentorAssignment,
  Grade,
} from '@prisma/client';

export class Mentor {
  constructor(
    public readonly id: string,
    public documentType: DocumentType,
    public document: string,
    public email: string,
    public authUserId: string,
    public firstNames: string,
    public lastNameFather: string,
    public lastNameMother: string,
    public phone: string,
    public country: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public peruDepartment?: PeruDepartment,
    public courseIds?: string[],
    public organizationIds?: string[],
    public gradeIds?: string[],
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
    data: MentorModel & {
      mentorCourses?: MentorCourse[];
      mentorAssignments?: MentorAssignment[];
      grades?: Grade[];
    },
  ): Mentor {
    return new Mentor(
      data.id,
      data.documentType,
      data.document,
      data.email,
      data.authUserId ?? '',
      data.firstNames,
      data.lastNameFather,
      data.lastNameMother,
      data.phone,
      data.country,
      data.createdAt,
      data.updatedAt,
      data.peruDepartment ?? undefined,
      data.mentorCourses?.map((mc) => mc.courseId),
      data.mentorAssignments?.map((ma) => ma.organizationId),
      data.grades?.map((g) => g.id),
      data.deletedAt ?? undefined,
    );
  }
}
