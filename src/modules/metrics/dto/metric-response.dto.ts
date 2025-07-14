export class InternOrgStatsDto {
  courseId: string;
  courseName: string;
  internsWithOrg: number;
  organizationsWithTeam: number;
}

export class TopInternDto {
  internId: string;
  fullName: string;
  totalNote: number;
  recommended: boolean;
  recommendationComment?: string;
}

export class CourseValueDto {
  courseId: string;
  courseName: string;
  value: number;
}

export class CourseCalendarDto {
  courseId: string;
  courseName: string;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'ONGOING' | 'FINISHED';
}

export class DashboardSummaryDto {
  topInterns: TopInternDto[];
  studentsPerCourse: CourseValueDto[];
  finalReportsPerCourse: CourseValueDto[];
  talksPerCourse: CourseValueDto[];
  fullyEvaluatedPerCourse: CourseValueDto[];
  certificatesPerCourse: CourseValueDto[];
  courseCalendar: CourseCalendarDto[];
  internsAndOrganizations: InternOrgStatsDto[];
}
