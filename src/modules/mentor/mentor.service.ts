import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MentorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMentorDto): Promise<Mentor> {
    try {
      const mentor = await this.prisma.mentor.create({
        data: {
          ...dto,
        },
        include: {
          mentorCourses: true,
          mentorAssignments: true,
          grades: true,
        },
      });

      return Mentor.fromPrisma(mentor);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The document or email is already registered.',
        );
      }
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while creating the mentor.',
      );
    }
  }

  async createInCourse(
    courseId: string,
    dto: CreateMentorDto,
  ): Promise<Mentor> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { document: dto.document },
      include: { mentorCourses: true },
    });

    if (mentor) {
      const alreadyRelated = mentor.mentorCourses.some(
        (relation) => relation.courseId === courseId,
      );

      if (alreadyRelated) {
        throw new ConflictException(
          'The mentor is already registered and associated with this course.',
        );
      }

      await this.prisma.mentorCourse.create({
        data: {
          mentorId: mentor.id,
          courseId: courseId,
        },
      });

      const updatedMentor = await this.prisma.mentor.findUnique({
        where: { id: mentor.id },
        include: { mentorCourses: true, mentorAssignments: true },
      });

      if (!updatedMentor) {
        throw new InternalServerErrorException(
          'Unexpected error retrieving the updated mentor.',
        );
      }

      return Mentor.fromPrisma(updatedMentor);
    }

    try {
      const newMentor = await this.prisma.mentor.create({
        data: {
          ...dto,
          mentorCourses: {
            create: { courseId },
          },
        },
        include: { mentorCourses: true, mentorAssignments: true },
      });

      return Mentor.fromPrisma(newMentor);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'The document or email is already registered.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the mentor.',
      );
    }
  }

  async findAll(): Promise<Mentor[]> {
    try {
      const data = await this.prisma.mentor.findMany({
        where: { deletedAt: null },
        include: { mentorCourses: true, mentorAssignments: true, grades: true },
      });

      return data.map((m) => Mentor.fromPrisma(m));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving mentors.',
      );
    }
  }

  async findAllByCourse(courseId: string): Promise<Mentor[]> {
    try {
      const mentors = await this.prisma.mentor.findMany({
        where: {
          mentorCourses: {
            some: { courseId },
          },
          deletedAt: null,
        },
        include: { mentorCourses: true, mentorAssignments: true },
      });

      return mentors.map((m) => Mentor.fromPrisma(m));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving mentors from the course.',
      );
    }
  }

  async findAllByCourseAndOrganization(
    courseId: string,
    organizationId: string,
  ): Promise<Mentor[]> {
    try {
      const mentors = await this.prisma.mentor.findMany({
        where: {
          mentorAssignments: {
            some: { courseId, organizationId },
          },
          deletedAt: null,
        },
        include: { mentorCourses: true, mentorAssignments: true, grades: true },
      });

      return mentors.map((m) => Mentor.fromPrisma(m));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving mentors from the course and the organization',
      );
    }
  }

  async findOne(mentorId: string): Promise<Mentor> {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        mentorCourses: true,
        mentorAssignments: true,
        grades: true,
      },
    });

    if (!mentor || mentor.deletedAt) {
      throw new NotFoundException(
        'The mentor does not exist or has been deleted.',
      );
    }

    return Mentor.fromPrisma(mentor);
  }

  async findOneByCourse(courseId: string, mentorId: string): Promise<Mentor> {
    const mentor = await this.prisma.mentor.findFirst({
      where: {
        id: mentorId,
        mentorCourses: {
          some: { courseId },
        },
        deletedAt: null,
      },
      include: {
        mentorCourses: true,
        mentorAssignments: true,
        grades: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException(
        'The mentor is not registered in this course or does not exist.',
      );
    }

    return Mentor.fromPrisma(mentor);
  }

  async update(mentorId: string, dto: UpdateMentorDto): Promise<Mentor> {
    const existingMentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        mentorCourses: true,
        mentorAssignments: true,
        grades: true,
      },
    });

    if (!existingMentor || existingMentor.deletedAt) {
      throw new NotFoundException('The mentor does not exist.');
    }

    try {
      const updatedMentor = await this.prisma.mentor.update({
        where: { id: mentorId },
        data: dto,
        include: {
          mentorCourses: true,
          mentorAssignments: true,
        },
      });

      return Mentor.fromPrisma(updatedMentor);
    } catch (error: any) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'The document or email is already registered by another mentor.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the mentor.',
      );
    }
  }

  async addOrganizationAssignmentFromCourse(
    courseId: string,
    organizationId: string,
    mentorId: string,
  ): Promise<void> {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        mentorCourses: true,
        mentorAssignments: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const isMentorInCourse = mentor.mentorCourses.some(
      (mc) => mc.courseId === courseId,
    );

    if (!isMentorInCourse) {
      throw new ConflictException(
        'Mentor is not associated with the specified course.',
      );
    }

    const alreadyAssigned = mentor.mentorAssignments.some(
      (assignment) =>
        assignment.courseId === courseId &&
        assignment.organizationId === organizationId,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'The mentor is already assigned to this organization in the specified course.',
      );
    }

    const organizationInCourse =
      await this.prisma.organizationCourse.findUnique({
        where: {
          organizationId_courseId: {
            organizationId,
            courseId,
          },
        },
      });

    if (!organizationInCourse) {
      throw new ConflictException(
        'The organization is not associated with the specified course.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.mentorAssignment.create({
        data: {
          mentorId,
          organizationId,
          courseId,
        },
      });

      await tx.grade.updateMany({
        where: {
          courseId,
          organizationId,
        },
        data: {
          mentorId,
        },
      });
    });
  }

  async removeOrganizationAssignmentFromCourse(
    courseId: string,
    organizationId: string,
    mentorId: string,
  ): Promise<void> {
    const assignment = await this.prisma.mentorAssignment.findFirst({
      where: {
        courseId,
        organizationId,
        mentorId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'The mentor is not assigned to this organization in this course.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.mentorAssignment.delete({
          where: { id: assignment.id },
        });

        await tx.grade.updateMany({
          where: {
            courseId,
            organizationId,
            mentorId,
          },
          data: {
            mentorId: null,
          },
        });
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while removing the mentor assignment.',
      );
    }
  }

  async softDelete(mentorId: string): Promise<void> {
    const existingMentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!existingMentor || existingMentor.deletedAt) {
      throw new NotFoundException(
        'The mentor does not exist or has already been deleted.',
      );
    }

    try {
      await this.prisma.mentor.update({
        where: { id: mentorId },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while deleting the mentor.',
      );
    }
  }
}
