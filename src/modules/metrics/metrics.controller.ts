import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import {
  CourseCalendarDto,
  CourseValueDto,
  DashboardSummaryDto,
  InternOrgStatsDto,
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
  topInterns(@Param('courseId') courseId: string): Promise<TopInternDto[]> {
    return this.metricsService.topInterns(courseId);
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

  @Get('summary/:courseId')
  dashboardSummary(
    @Param('courseId') courseId: string,
  ): Promise<DashboardSummaryDto> {
    return this.metricsService.dashboardSummary(courseId);
  }
}
