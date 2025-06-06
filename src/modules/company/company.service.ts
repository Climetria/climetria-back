import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: string, dto: CreateCompanyDto): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        ...dto,
        courseId,
      },
    });
    return Company.fromPrisma(company);
  }

  async findAllByCourse(courseId: string): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
    });
    return companies.map((c) => Company.fromPrisma(c));
  }

  async findOne(courseId: string, companyId: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
        courseId,
        deletedAt: null,
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found in this course');
    }
    return Company.fromPrisma(company);
  }

  async update(
    courseId: string,
    companyId: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { ...dto, courseId },
    });
    return Company.fromPrisma(company);
  }

  async softDelete(courseId: string, companyId: string): Promise<void> {
    await this.prisma.company.update({
      where: { id: companyId },
      data: { deletedAt: new Date() },
    });
  }
}
