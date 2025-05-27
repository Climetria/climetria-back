import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { Intern } from './entities/intern.entity';

@Injectable()
export class InternService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInternDto): Promise<Intern> {
    const intern = await this.prisma.intern.create({ data: dto });
    return Intern.fromPrisma(intern);
  }

  async findAll(): Promise<Intern[]> {
    const interns = await this.prisma.intern.findMany();
    return interns.map(Intern.fromPrisma);
  }

  async findOne(id: string): Promise<Intern> {
    const intern = await this.prisma.intern.findUnique({ where: { id } });
    if (!intern) throw new NotFoundException('Intern not found');
    return Intern.fromPrisma(intern);
  }
}
