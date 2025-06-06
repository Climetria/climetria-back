import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const course = await this.prisma.course.create({ data: dto });
    return Course.fromPrisma(course);
  }

  async findAll(): Promise<Course[]> {
    const data = await this.prisma.course.findMany({
      where: { deletedAt: null },
    });
    return data.map((c) => Course.fromPrisma(c));
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id, deletedAt: null },
    });
    if (!course) throw new NotFoundException('Course not found');
    return Course.fromPrisma(course);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id, deletedAt: null },
      data: dto,
    });
    return Course.fromPrisma(course);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
