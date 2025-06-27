import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Grade } from './entities/grade.entity';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}

  async createGrade(courseId: string, internId: string): Promise<Grade> {
    // 1. Confirm intern is enrolled in the course
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

    // 2. Find the organization assigned to the intern in this course
    const internAssignment = await this.prisma.internAssignment.findFirst({
      where: { internId, courseId },
    });

    if (!internAssignment) {
      throw new NotFoundException(
        'Intern has no organization assigned for this course',
      );
    }

    const organizationId = internAssignment.organizationId;

    // 3. Find the mentor assigned to that course and organization
    const mentorAssignment = await this.prisma.mentorAssignment.findFirst({
      where: { courseId, organizationId },
    });

    if (!mentorAssignment) {
      throw new NotFoundException(
        'No mentor is assigned to this course and organization',
      );
    }

    const mentorId = mentorAssignment.mentorId;

    // 4. Ensure there isn't already a grade for this intern in the course
    const existingGrade = await this.prisma.grade.findUnique({
      where: {
        internId_courseId: {
          internId,
          courseId,
        },
      },
    });

    if (existingGrade) {
      throw new ConflictException(
        'Grade already exists for this intern in the course',
      );
    }

    // 5. Create grade
    const grade = await this.prisma.grade.create({
      data: {
        courseId,
        internId,
        mentorId,
      },
      include: {
        course: true,
        intern: true,
        mentor: true,
      },
    });

    return Grade.fromPrisma(grade);
  }

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
    const existingGrade = await this.prisma.grade.findUnique({
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

    if (!existingGrade) {
      throw new NotFoundException(
        'Grade not found for this intern in the course',
      );
    }

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
  }
}
