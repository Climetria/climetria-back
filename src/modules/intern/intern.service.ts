import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { Intern } from './entities/intern.entity';
import { UpdateInternDto } from './dto/update-intern.dto';

@Injectable()
export class InternService {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: string, dto: CreateInternDto): Promise<Intern> {
    const intern = await this.prisma.intern.create({
      data: {
        ...dto,
        courseId,
      },
    });
    return Intern.fromPrisma(intern);
  }

  async findAllByCourse(courseId: string): Promise<Intern[]> {
    const interns = await this.prisma.intern.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
    });
    return interns.map((i) => Intern.fromPrisma(i));
  }

  async findOne(courseId: string, internId: string): Promise<Intern> {
    const intern = await this.prisma.intern.findUnique({
      where: {
        id: internId,
        courseId,
        deletedAt: null,
      },
    });
    if (!intern) {
      throw new NotFoundException('Intern not found in this course');
    }
    return Intern.fromPrisma(intern);
  }

  async update(
    courseId: string,
    internId: string,
    dto: UpdateInternDto,
  ): Promise<Intern> {
    const intern = await this.prisma.intern.update({
      where: { id: internId, deletedAt: null },
      data: { ...dto, courseId },
    });
    return Intern.fromPrisma(intern);
  }

  async softDelete(courseId: string, internId: string): Promise<void> {
    await this.prisma.intern.update({
      where: { id: internId },
      data: { deletedAt: new Date() },
    });
  }
}
