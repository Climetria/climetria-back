import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import {
  CourseCalendarDto,
  CourseValueDto,
  DashboardSummaryByCourseDto,
  DashboardSummaryDto,
  InternOrgStatsDto,
  TopInternByCourseDto,
  TopInternDto,
} from './dto/metric-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('interns-organizations')
  internsAndOrganizations(): Promise<InternOrgStatsDto[]> {
    return this.metricsService.internsAndOrgsPerCourse();
  }

  @Get('courses/:courseId/top-interns')
  topInterns(): Promise<TopInternDto[]> {
    return this.metricsService.topInterns();
  }

  @Get('courses/:courseId/top-interns')
  topInternsByCourse(
    @Param('courseId') courseId: string,
  ): Promise<TopInternByCourseDto[]> {
    return this.metricsService.topInternsByCourse(courseId);
  }

  @Get('students-per-course')
  studentsPerCourse(): Promise<CourseValueDto[]> {
    return this.metricsService.studentsPerCourse();
  }

  @Get('final-reports')
  finalReports(): Promise<CourseValueDto[]> {
    return this.metricsService.finalReportsPerCourse();
  }

  @Get('talks')
  talks(): Promise<CourseValueDto[]> {
    return this.metricsService.talksPerCourse();
  }

  @Get('fully-evaluated')
  fullyEvaluated(): Promise<CourseValueDto[]> {
    return this.metricsService.fullyEvaluatedPerCourse();
  }

  @Get('certificates')
  certificates(): Promise<CourseValueDto[]> {
    return this.metricsService.certificatesPerCourse();
  }

  @Get('course-calendar')
  courseCalendar(): Promise<CourseCalendarDto[]> {
    return this.metricsService.courseDates();
  }

  @Get('summary')
  dashboardSummary(): Promise<DashboardSummaryDto> {
    return this.metricsService.dashboardSummary();
  }

  @Get('summary/:courseId')
  dashboardSummaryByCourse(
    @Param('courseId') courseId: string,
  ): Promise<DashboardSummaryByCourseDto> {
    return this.metricsService.dashboardSummaryByCourse(courseId);
  }
}
