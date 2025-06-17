import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { InternService } from './intern.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { InternResponseDto } from './dto/intern-response.dto';
import { UpdateInternDto } from './dto/update-intern.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvUploadInternResponseDto } from './dto/csv-upload-intern-response.dto';
import { Express } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class InternController {
  constructor(private readonly internService: InternService) {}

  @Get('interns')
  async findAll(): Promise<InternResponseDto[]> {
    const interns = await this.internService.findAll();
    return interns.map((i) => InternResponseDto.fromEntity(i));
  }

  @Get('interns/:internId')
  async findOne(
    @Param('internId') internId: string,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.findOne(internId);
    return InternResponseDto.fromEntity(intern);
  }

  @Post('interns')
  async create(@Body() dto: CreateInternDto): Promise<InternResponseDto> {
    const intern = await this.internService.create(dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Post('interns/batch')
  @UseInterceptors(FileInterceptor('file'))
  async batchCreateFromCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CsvUploadInternResponseDto> {
    const csvContent = file.buffer.toString('utf-8');
    return this.internService.batchCreateFromCsv(csvContent);
  }

  @Patch('interns/:internId')
  async update(
    @Param('internId') internId: string,
    @Body() dto: UpdateInternDto,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.update(internId, dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Delete('interns/:internId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('internId') internId: string): Promise<void> {
    await this.internService.softDelete(internId);
  }

  @Get('courses/:courseId/interns')
  async findAllByCourse(
    @Param('courseId') courseId: string,
  ): Promise<InternResponseDto[]> {
    const interns = await this.internService.findAllByCourse(courseId);
    return interns.map((i) => InternResponseDto.fromEntity(i));
  }

  @Get('courses/:courseId/interns/:internId')
  async findOneByCourse(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.findOneByCourse(courseId, internId);
    return InternResponseDto.fromEntity(intern);
  }

  @Post('courses/:courseId/interns')
  async createInCourse(
    @Param('courseId') courseId: string,
    @Body() dto: CreateInternDto,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.createInCourse(courseId, dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Post('courses/:courseId/interns/batch')
  @UseInterceptors(FileInterceptor('file'))
  async batchCreateFromCsvInCourse(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CsvUploadInternResponseDto> {
    const csvContent = file.buffer.toString('utf-8');
    return this.internService.batchCreateFromCsvInCourse(courseId, csvContent);
  }

  @Patch('courses/:courseId/interns/:internId')
  async updateInCourse(
    @Param('internId') internId: string,
    @Body() dto: UpdateInternDto,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.update(internId, dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Delete('courses/:courseId/interns/:internId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteInCourse(@Param('internId') internId: string): Promise<void> {
    await this.internService.softDelete(internId);
  }

  @Get('courses/:courseId/organizations/:organizationId/interns')
  async findAllByCourseAndOrganization(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
  ): Promise<InternResponseDto[]> {
    const interns = await this.internService.findAllByCourseAndOrganization(
      courseId,
      organizationId,
    );
    return interns.map((i) => InternResponseDto.fromEntity(i));
  }

  @Patch('courses/:courseId/organizations/:organizationId/interns/:internId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addOrganizationAssignmentFromCourse(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
    @Param('internId') internId: string,
  ): Promise<void> {
    await this.internService.addOrganizationAssignmentFromCourse(
      courseId,
      organizationId,
      internId,
    );
  }

  @Delete('courses/:courseId/organizations/:organizationId/interns/:internId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOrganizationAssignmentFromCourse(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
    @Param('internId') internId: string,
  ): Promise<void> {
    await this.internService.removeOrganizationAssignmentFromCourse(
      courseId,
      organizationId,
      internId,
    );
  }
}
