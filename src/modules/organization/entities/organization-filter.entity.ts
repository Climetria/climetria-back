import {
  Course,
  GenderSelection,
  Major,
  Organization,
  OrganizationCourse as OrganizationFilterModel,
  PeruDepartment,
} from '@prisma/client';

export class OrganizationFilter {
  constructor(
    public readonly id: string,
    public courseId: string,
    public organizationId: string,
    public maximumNumberOfInterns: number,
    public placeOfResidenceFilter: PeruDepartment[],
    public studiedMajorFilter: Major[],
    public genderFilter: GenderSelection,
    public extraRequirements: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(
    data: OrganizationFilterModel & {
      organization: Organization;
      course: Course;
    },
  ): OrganizationFilter {
    return new OrganizationFilter(
      data.id,
      data.course.id,
      data.organization.id,
      data.maximumNumberOfInterns,
      data.placeOfResidenceFilter,
      data.studiedMajorFilter,
      data.genderFilter,
      data.extraRequirements ?? '',
      data.createdAt,
      data.updatedAt,
    );
  }
}
