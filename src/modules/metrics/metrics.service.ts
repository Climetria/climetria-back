import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CourseTopInternDto,
  CourseTopInternsMetricDto,
} from './dto/metric-response.dto';
import { Grade } from '../grade/entities/grade.entity';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getTotalInternsInCourse(courseId: string) {
    const count = await this.prisma.internCourse.count({
      where: { courseId },
    });

    return { courseId, totalInterns: count };
  }

  async getTopInternsByCourse(
    courseId: string,
  ): Promise<CourseTopInternsMetricDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const grades = await this.prisma.grade.findMany({
      where: { courseId },
      include: { intern: true },
    });

    const topInterns: CourseTopInternDto[] = grades
      .map((g) => {
        const entity = Grade.fromPrisma({
          ...g,
          intern: g.intern,
          course,
        } as any);

        return {
          internId: g.intern.id,
          fullName: `${g.intern.firstNames} ${g.intern.lastNameFather} ${g.intern.lastNameMother}`,
          totalNote: entity.totalNote,
          recommendationCheck: g.recommendationCheck,
          recommendationComment: g.recommendation ?? null,
        };
      })
      .sort((a, b) => b.totalNote - a.totalNote)
      .slice(0, 3);

    return {
      courseId,
      courseName: course.name,
      topInterns,
    };
  }
}
