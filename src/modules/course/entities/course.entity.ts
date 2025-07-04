import {
  Course as CourseModel,
  MentorCourse,
  OrganizationCourse,
  InternCourse,
  Grade,
} from '@prisma/client';

export class Course {
  constructor(
    public readonly id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public description?: string,
    public mentorIds?: string[],
    public organizationIds?: string[],
    public internIds?: string[],
    public gradeIds?: string[],
    public deletedAt?: Date,
  ) {}

  get mentorStatus(): string {
    return this.mentorIds && this.mentorIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  get organizationStatus(): string {
    return this.organizationIds && this.organizationIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  get internStatus(): string {
    return this.internIds && this.internIds.length > 0
      ? 'assigned'
      : 'unassigned';
  }

  static fromPrisma(
    data: CourseModel & {
      mentorCourses?: MentorCourse[];
      organizationCourses?: OrganizationCourse[];
      internCourses?: InternCourse[];
      grades?: Grade[];
    },
  ): Course {
    return new Course(
      data.id,
      data.name,
      data.startDate,
      data.endDate,
      data.createdAt,
      data.updatedAt,
      data.description ?? undefined,
      data.mentorCourses?.map((mc) => mc.mentorId),
      data.organizationCourses?.map((oc) => oc.organizationId),
      data.internCourses?.map((ic) => ic.internId),
      data.grades?.map((g) => g.id),
      data.deletedAt ?? undefined,
    );
  }
}
