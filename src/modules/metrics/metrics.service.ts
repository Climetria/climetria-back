import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CourseCalendarDto,
  CourseValueDto,
  DashboardSummaryByCourseDto,
  DashboardSummaryDto,
  InternOrgStatsDto,
  TopInternByCourseDto,
  TopInternDto,
} from './dto/metric-response.dto';
import { Grade } from '../grade/entities/grade.entity';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  private async getCourseMap(): Promise<Map<string, string>> {
    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    });

    return new Map(courses.map((c) => [c.id, c.name]));
  }

  async internsAndOrgsPerCourse(): Promise<InternOrgStatsDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    });

    if (!courses.length) return [];

    const internCounts = await this.prisma.internAssignment.groupBy({
      by: ['courseId', 'internId'],
    });

    const orgCounts = await this.prisma.internAssignment.groupBy({
      by: ['courseId', 'organizationId'],
    });

    const internMap = new Map<string, number>();
    internCounts.forEach((row) =>
      internMap.set(row.courseId, (internMap.get(row.courseId) ?? 0) + 1),
    );

    const orgMap = new Map<string, number>();
    orgCounts.forEach((row) =>
      orgMap.set(row.courseId, (orgMap.get(row.courseId) ?? 0) + 1),
    );

    return courses.map(({ id, name }) => ({
      courseId: id,
      courseName: name,
      internsWithOrg: internMap.get(id) ?? 0,
      organizationsWithTeam: orgMap.get(id) ?? 0,
    }));
  }

  async topInterns(): Promise<TopInternDto[]> {
    const grades = await this.prisma.grade.findMany({
      include: {
        intern: true,
        course: true,
        mentor: true,
        organization: true,
      },
    });

    const enriched = grades.map((g) => Grade.fromPrisma(g));
    enriched.sort((a, b) => b.totalNote - a.totalNote);

    return enriched.slice(0, 3).map((grade) => {
      const originalGrade = grades.find((g) => g.id === grade.id)!;
      const intern = originalGrade.intern;

      return {
        internId: grade.internId,
        fullName: `${intern.firstNames} ${intern.lastNameFather}`,
        courseId: grade.courseId,
        courseName: originalGrade.course.name,
        totalNote: grade.totalNote,
        recommended: grade.recommendationCheck,
        recommendationComment: grade.recommendation ?? undefined,
      };
    });
  }

  async topInternsByCourse(courseId: string): Promise<TopInternByCourseDto[]> {
    const grades = await this.prisma.grade.findMany({
      where: { courseId },
      include: {
        intern: true,
        course: true,
        mentor: true,
        organization: true,
      },
    });

    const enriched = grades.map((g) => Grade.fromPrisma(g));
    enriched.sort((a, b) => b.totalNote - a.totalNote);

    return enriched.slice(0, 3).map((grade) => {
      const intern = grades.find((g) => g.id === grade.id)!.intern;

      return {
        internId: grade.internId,
        fullName: `${intern.firstNames} ${intern.lastNameFather}`,
        totalNote: grade.totalNote,
        recommended: grade.recommendationCheck,
        recommendationComment: grade.recommendation ?? undefined,
      };
    });
  }

  async studentsPerCourse(): Promise<CourseValueDto[]> {
    const result = await this.prisma.internCourse.groupBy({
      by: ['courseId'],
      _count: { internId: true },
    });

    const courseMap = await this.getCourseMap();

    return result.map((r) => ({
      courseId: r.courseId,
      courseName: courseMap.get(r.courseId) ?? '',
      value: r._count.internId,
    }));
  }

  async finalReportsPerCourse(): Promise<CourseValueDto[]> {
    const result = await this.prisma.grade.groupBy({
      by: ['courseId'],
      where: { finalReportCheck: true },
      _count: { _all: true },
    });

    const courseMap = await this.getCourseMap();

    return result.map((r) => ({
      courseId: r.courseId,
      courseName: courseMap.get(r.courseId) ?? '',
      value: r._count._all,
    }));
  }

  async talksPerCourse(): Promise<CourseValueDto[]> {
    const result = await this.prisma.grade.groupBy({
      by: ['courseId'],
      where: { talkCheck: true },
      _count: { _all: true },
    });

    const courseMap = await this.getCourseMap();

    return result.map((r) => ({
      courseId: r.courseId,
      courseName: courseMap.get(r.courseId) ?? '',
      value: r._count._all,
    }));
  }

  async fullyEvaluatedPerCourse(): Promise<CourseValueDto[]> {
    const grades = await this.prisma.grade.findMany({
      where: {
        NOT: {
          OR: [
            { punctuality: null },
            { classParticipation: null },
            { proactivity: null },
            { communicationSkills: null },
            { punctualityOfDelivery: null },
            { redaction: null },
            { s1: null },
            { s2: null },
            { s3: null },
            { s4: null },
            { s5: null },
            { s6: null },
          ],
        },
      },
    });

    const counts = new Map<string, number>();
    for (const g of grades) {
      counts.set(g.courseId, (counts.get(g.courseId) ?? 0) + 1);
    }

    const courseMap = await this.getCourseMap();

    return Array.from(counts.entries()).map(([courseId, count]) => ({
      courseId,
      courseName: courseMap.get(courseId) ?? '',
      value: count,
    }));
  }

  async certificatesPerCourse(): Promise<CourseValueDto[]> {
    const grades = await this.prisma.grade.findMany({
      include: {
        intern: true,
        course: true,
        mentor: true,
        organization: true,
      },
    });

    const gradesWithCert = grades
      .map((g) => Grade.fromPrisma(g))
      .filter((g) => g.courseCertificate);

    const counts = new Map<string, number>();
    for (const g of gradesWithCert) {
      counts.set(g.courseId, (counts.get(g.courseId) ?? 0) + 1);
    }

    const courseMap = await this.getCourseMap();

    return Array.from(counts.entries()).map(([courseId, count]) => ({
      courseId,
      courseName: courseMap.get(courseId) ?? '',
      value: count,
    }));
  }

  async courseDates(): Promise<CourseCalendarDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, startDate: true, endDate: true },
    });

    const now = new Date();

    return courses.map((c) => ({
      courseId: c.id,
      courseName: c.name,
      startDate: c.startDate,
      endDate: c.endDate,
      status:
        now < c.startDate
          ? 'PENDING'
          : now > c.endDate
            ? 'FINISHED'
            : 'ONGOING',
    }));
  }

  async dashboardSummary(): Promise<DashboardSummaryDto> {
    const [
      topInterns,
      studentsPerCourse,
      finalReportsPerCourse,
      talksPerCourse,
      fullyEvaluatedPerCourse,
      certificatesPerCourse,
      courseCalendar,
      internsAndOrganizations,
    ] = await Promise.all([
      this.topInterns(),
      this.studentsPerCourse(),
      this.finalReportsPerCourse(),
      this.talksPerCourse(),
      this.fullyEvaluatedPerCourse(),
      this.certificatesPerCourse(),
      this.courseDates(),
      this.internsAndOrgsPerCourse(),
    ]);

    return {
      topInterns,
      studentsPerCourse,
      finalReportsPerCourse,
      talksPerCourse,
      fullyEvaluatedPerCourse,
      certificatesPerCourse,
      courseCalendar,
      internsAndOrganizations,
    };
  }

  async dashboardSummaryByCourse(
    courseId: string,
  ): Promise<DashboardSummaryByCourseDto> {
    const [
      topInternsByCourse,
      studentsPerCourse,
      finalReportsPerCourse,
      talksPerCourse,
      fullyEvaluatedPerCourse,
      certificatesPerCourse,
      courseCalendar,
      internsAndOrganizations,
    ] = await Promise.all([
      this.topInternsByCourse(courseId),
      this.studentsPerCourse(),
      this.finalReportsPerCourse(),
      this.talksPerCourse(),
      this.fullyEvaluatedPerCourse(),
      this.certificatesPerCourse(),
      this.courseDates(),
      this.internsAndOrgsPerCourse(),
    ]);

    return {
      topInternsByCourse,
      studentsPerCourse,
      finalReportsPerCourse,
      talksPerCourse,
      fullyEvaluatedPerCourse,
      certificatesPerCourse,
      courseCalendar,
      internsAndOrganizations,
    };
  }
}
