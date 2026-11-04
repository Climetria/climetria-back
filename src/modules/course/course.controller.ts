import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @Roles('admin', 'mentor')
  async findAll(): Promise<CourseResponseDto[]> {
    const courses = await this.courseService.findAll();
    return courses.map((c) => CourseResponseDto.fromEntity(c));
  }

  @Get(':courseId')
  async findOne(
    @Param('courseId') courseId: string,
  ): Promise<CourseResponseDto> {
    const course = await this.courseService.findOne(courseId);
    return CourseResponseDto.fromEntity(course);
  }

  @Post()
  async create(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.courseService.create(dto);
    return CourseResponseDto.fromEntity(course);
  }

  @Patch(':courseId')
  async update(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseService.update(courseId, dto);
    return CourseResponseDto.fromEntity(course);
  }

  @Delete(':courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('courseId') courseId: string): Promise<void> {
    await this.courseService.softDelete(courseId);
  }
}
