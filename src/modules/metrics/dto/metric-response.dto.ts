export class BaseCourseMetricDto {
  courseId: string;
  courseName: string;
}

export interface CourseCountMetricDto extends BaseCourseMetricDto {
  value: number;
}

export interface CourseTopInternDto {
  internId: string;
  fullName: string;
  totalNote: number;
  recommendationCheck: boolean;
  recommendationComment?: string | null;
}

export interface CourseTopInternsMetricDto extends BaseCourseMetricDto {
  topInterns: CourseTopInternDto[];
}

export interface CourseDatesMetricDto extends BaseCourseMetricDto {
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'FINISHED';
}
