import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const course = await this.prisma.course.create({
      data: dto,
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
        grades: true,
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
        grades: true,
      },
    });
    return data.map((c) => Course.fromPrisma(c));
  }

  async findOne(courseId: string): Promise<Course> {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
        grades: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return Course.fromPrisma(course);
  }

  async update(courseId: string, dto: UpdateCourseDto): Promise<Course> {
    const existingCourse = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
    });

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: dto,
    });

    const updatedCourse = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
        grades: true,
      },
    });

    return Course.fromPrisma(updatedCourse!);
  }

  async softDelete(courseId: string): Promise<void> {
    const existingCourse = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
    });

    if (!existingCourse) {
      throw new NotFoundException(
        `Course with ID '${courseId}' not found or already deleted`,
      );
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });
  }
}
