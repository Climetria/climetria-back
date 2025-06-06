import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';
import { UpdateMentorDto } from './dto/update-mentor.dto';

@Injectable()
export class MentorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: string, dto: CreateMentorDto): Promise<Mentor> {
    const mentor = await this.prisma.mentor.create({
      data: {
        ...dto,
        courseId,
      },
    });
    return Mentor.fromPrisma(mentor);
  }

  async findAllByCourse(courseId: string): Promise<Mentor[]> {
    const mentors = await this.prisma.mentor.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
    });
    return mentors.map((m) => Mentor.fromPrisma(m));
  }

  async findOne(courseId: string, mentorId: string): Promise<Mentor> {
    const mentor = await this.prisma.mentor.findUnique({
      where: {
        id: mentorId,
        courseId,
        deletedAt: null,
      },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found in this course');
    }
    return Mentor.fromPrisma(mentor);
  }

  async update(
    courseId: string,
    mentorId: string,
    dto: UpdateMentorDto,
  ): Promise<Mentor> {
    const mentor = await this.prisma.mentor.update({
      where: { id: mentorId, deletedAt: null },
      data: { ...dto, courseId },
    });
    return Mentor.fromPrisma(mentor);
  }

  async softDelete(courseId: string, mentorId: string): Promise<void> {
    await this.prisma.mentor.update({
      where: { id: mentorId },
      data: { deletedAt: new Date() },
    });
  }
}
