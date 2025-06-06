import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('courses/:courseId/companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll(
    @Param('courseId') courseId: string,
  ): Promise<CompanyResponseDto[]> {
    const companies = await this.companyService.findAllByCourse(courseId);
    return companies.map((i) => CompanyResponseDto.fromEntity(i));
  }

  @Get(':companyId')
  async findOne(
    @Param('courseId') courseId: string,
    @Param('companyId') companyId: string,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.findOne(courseId, companyId);

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${companyId} in course ${courseId} not found`,
      );
    }

    return CompanyResponseDto.fromEntity(company);
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.create(courseId, dto);
    return CompanyResponseDto.fromEntity(company);
  }

  @Patch(':companyId')
  async update(
    @Param('courseId') courseId: string,
    @Param('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyService.update(courseId, companyId, dto);
    return CompanyResponseDto.fromEntity(company);
  }

  @Delete(':companyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param('courseId') courseId: string,
    @Param('companyId') companyId: string,
  ): Promise<void> {
    await this.companyService.softDelete(courseId, companyId);
  }
}
