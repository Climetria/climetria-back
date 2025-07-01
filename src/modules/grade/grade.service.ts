import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Grade } from './entities/grade.entity';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}

  async findForIntern(courseId: string, internId: string): Promise<Grade> {
    const internCourse = await this.prisma.internCourse.findUnique({
      where: {
        internId_courseId: {
          internId,
          courseId,
        },
      },
    });

    if (!internCourse) {
      throw new NotFoundException('Intern is not enrolled in the course');
    }

    const grade = await this.prisma.grade.findUnique({
      where: {
        internId_courseId: {
          internId,
          courseId,
        },
      },
      include: {
        course: true,
        intern: true,
        mentor: true,
      },
    });

    if (!grade) {
      throw new NotFoundException(
        'No grade exists for this intern in the course',
      );
    }

    return Grade.fromPrisma(grade);
  }

  async update(
    courseId: string,
    internId: string,
    dto: UpdateGradeDto,
  ): Promise<Grade> {
    try {
      const updated = await this.prisma.grade.update({
        where: {
          internId_courseId: {
            internId,
            courseId,
          },
        },
        data: dto,
        include: {
          course: true,
          intern: true,
          mentor: true,
        },
      });

      return Grade.fromPrisma(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Grade not found for this intern in the course',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the grade.',
      );
    }
  }

  async delete(courseId: string, internId: string): Promise<void> {
    const existingGrade = await this.prisma.grade.findUnique({
      where: {
        internId_courseId: {
          internId,
          courseId,
        },
      },
    });

    if (!existingGrade) {
      throw new NotFoundException(
        'Grade not found for this intern in the course',
      );
    }

    await this.prisma.grade.delete({
      where: {
        internId_courseId: {
          internId,
          courseId,
        },
      },
    });
  }
}
