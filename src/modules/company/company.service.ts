import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCompanyDto): Promise<Company> {
        const company = await this.prisma.company.create({ data: dto });
        return Company.fromPrisma(company);
    }

    async findAll(): Promise<Company[]> {
        const companies = await this.prisma.company.findMany();
        return companies.map(Company.fromPrisma);
    }

    async findOne(id: string): Promise<Company> {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        return Company.fromPrisma(company);
    }

    async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
        const company = await this.prisma.company.update({
            where: { id },
            data: dto,
        });
        return Company.fromPrisma(company);
    }

    async remove(id: string): Promise<void> {
        await this.prisma.company.delete({ where: { id } });
    }
}
