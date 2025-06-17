import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const { mentorIds, organizationIds, internIds, ...courseData } = dto;

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        mentorCourses:
          mentorIds && mentorIds.length > 0
            ? {
                createMany: {
                  data: mentorIds.map((mentorId) => ({ mentorId })),
                },
              }
            : undefined,
        organizationCourses:
          organizationIds && organizationIds.length > 0
            ? {
                createMany: {
                  data: organizationIds.map((organizationId) => ({
                    organizationId,
                  })),
                },
              }
            : undefined,
        internCourses:
          internIds && internIds.length > 0
            ? {
                createMany: {
                  data: internIds.map((internId) => ({ internId })),
                },
              }
            : undefined,
      },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
      },
    });

    return Course.fromPrisma(course);
  }

  async findAll(): Promise<Course[]> {
    const data = await this.prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
      },
    });
    return data.map((c) => Course.fromPrisma(c));
  }

  async findOne(courseId: string): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return Course.fromPrisma(course);
  }

  async update(courseId: string, dto: UpdateCourseDto): Promise<Course> {
    const { mentorIds, organizationIds, internIds, ...courseData } = dto;

    const existingCourse = await this.prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
      },
    });

    if (!existingCourse) throw new NotFoundException('Course not found');

    if (mentorIds) {
      await this.prisma.mentorCourse.deleteMany({
        where: { courseId },
      });
      await this.prisma.mentorCourse.createMany({
        data: mentorIds.map((mentorId) => ({ courseId, mentorId })),
      });
    }

    if (organizationIds) {
      await this.prisma.organizationCourse.deleteMany({
        where: { courseId },
      });
      await this.prisma.organizationCourse.createMany({
        data: organizationIds.map((organizationId) => ({
          courseId,
          organizationId,
        })),
      });
    }

    if (internIds) {
      await this.prisma.internCourse.deleteMany({
        where: { courseId },
      });
      await this.prisma.internCourse.createMany({
        data: internIds.map((internId) => ({ courseId, internId })),
      });
    }

    const course = await this.prisma.course.update({
      where: { id: courseId, deletedAt: null },
      data: courseData,
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
      },
    });
    return Course.fromPrisma(course);
  }

  async softDelete(courseId: string): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });
  }
}
