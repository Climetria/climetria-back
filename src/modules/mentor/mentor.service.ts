import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Mentor } from './entities/mentor.entity';

@Injectable()
export class MentorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMentorDto): Promise<Mentor> {
    const mentor = await this.prisma.mentor.create({ data: dto });
    return Mentor.fromPrisma(mentor);
  }

  async findAll(): Promise<Mentor[]> {
    const mentors = await this.prisma.mentor.findMany();
    return mentors.map(Mentor.fromPrisma);
  }

  async findOne(id: string): Promise<Mentor> {
    const mentor = await this.prisma.mentor.findUnique({ where: { id } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    return Mentor.fromPrisma(mentor);
  }
}
