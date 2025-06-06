import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InternService } from './intern.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { InternResponseDto } from './dto/intern-response.dto';
import { UpdateInternDto } from './dto/update-intern.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('courses/:courseId/interns')
@UseGuards(JwtAuthGuard)
export class InternController {
  constructor(private readonly internService: InternService) {}

  @Get()
  async findAll(
    @Param('courseId') courseId: string,
  ): Promise<InternResponseDto[]> {
    const interns = await this.internService.findAllByCourse(courseId);
    return interns.map((i) => InternResponseDto.fromEntity(i));
  }

  @Get(':internId')
  async findOne(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.findOne(courseId, internId);

    if (!intern) {
      throw new NotFoundException(
        `Intern with ID ${internId} in course ${courseId} not found`,
      );
    }

    return InternResponseDto.fromEntity(intern);
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateInternDto,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.create(courseId, dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Patch(':internId')
  async update(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
    @Body() dto: UpdateInternDto,
  ): Promise<InternResponseDto> {
    const intern = await this.internService.update(courseId, internId, dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Delete(':internId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<void> {
    await this.internService.softDelete(courseId, internId);
  }
}
