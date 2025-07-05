import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const existing = await this.prisma.course.findFirst({
      where: {
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A course with the same name and dates already exists.',
      );
    }
    
    const course = await this.prisma.course.create({ data: dto });
    return Course.fromPrisma(course);
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        mentorCourses: true,
        organizationCourses: true,
        internCourses: true,
        grades: true,
      },
    });
    return courses.map((c) => Course.fromPrisma(c));
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
      throw new NotFoundException(
        `Course with ID '${courseId}' not found or already deleted`,
      );
    }

    return Course.fromPrisma(course);
  }

  async update(courseId: string, dto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.prisma.course
      .update({
        where: { id: courseId },
        data: dto,
        include: {
          mentorCourses: true,
          organizationCourses: true,
          internCourses: true,
          grades: true,
        },
      })
      .catch((error: Prisma.PrismaClientKnownRequestError) => {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Course with ID '${courseId}' not found.`,
          );
        }
        throw error;
      });

    return Course.fromPrisma(updatedCourse);
  }

  async softDelete(courseId: string): Promise<void> {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID '${courseId}' not found or already deleted.`,
      );
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });
  }
}
