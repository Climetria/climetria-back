import {
  InternAssignment,
  MentorAssignment,
  OrganizationCourse,
  Organization as OrganizationModel,
  OrganizationSize,
  TopicCode,
} from '@prisma/client';

export class Organization {
  constructor(
    public readonly id: string,
    public ruc: string,
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
    public courseIds?: string[],
    public mentorIds?: string[],
    public internIds?: string[],
    public deletedAt?: Date,
  ) {}

  get courseStatus(): string {
    return this.courseIds && this.courseIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  get mentorStatus(): string {
    return this.mentorIds && this.mentorIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  get internStatus(): string {
    return this.internIds && this.internIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  static fromPrisma(
    data: OrganizationModel & {
      organizationCourses?: OrganizationCourse[];
      mentorAssignments?: MentorAssignment[];
      internAssignments?: InternAssignment[];
    },
  ): Organization {
    return new Organization(
      data.id,
      data.ruc,
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
      data.organizationCourses?.map((oc) => oc.courseId),
      data.mentorAssignments?.map((ma) => ma.mentorId),
      data.internAssignments?.map((ia) => ia.internId),
      data.deletedAt ?? undefined,
    );
  }
}
