import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@Controller('companies')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

    @Post()
    async create(@Body() dto: CreateCompanyDto): Promise<CompanyResponseDto> {
        const company = await this.companyService.create(dto);
        return CompanyResponseDto.fromEntity(company);
    }

    @Get()
    async findAll(): Promise<CompanyResponseDto[]> {
        const companies = await this.companyService.findAll();
        return companies.map(CompanyResponseDto.fromEntity);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<CompanyResponseDto> {
        const company = await this.companyService.findOne(id);
        return CompanyResponseDto.fromEntity(company);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCompanyDto,
    ): Promise<CompanyResponseDto> {
        const company = await this.companyService.update(id, dto);
        return CompanyResponseDto.fromEntity(company);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.companyService.remove(id);
    }
}
