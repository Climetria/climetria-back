import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GradeService } from './grade.service';
import { GradeResponseDto } from './dto/grade-response.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('grades')
  async findAll(): Promise<GradeResponseDto[]> {
    const grades = await this.gradeService.findAll();
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('courses/:courseId/grades')
  async findAllForCourse(
    @Param('courseId') courseId: string,
  ): Promise<GradeResponseDto[]> {
    const grades = await this.gradeService.findAllForCourse(courseId);
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('interns/:internId/grades')
  async findForIntern(
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto[]> {
    const grades = await this.gradeService.findAllForIntern(internId);
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('courses/:courseId/interns/:internId/grade')
  async findForCourseAndIntern(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradeService.findForCourseAndIntern(
      courseId,
      internId,
    );
    return GradeResponseDto.fromEntity(grade);
  }

  @Patch('courses/:courseId/interns/:internId/grade')
  async updateInCourse(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
    @Body() dto: UpdateGradeDto,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradeService.update(courseId, internId, dto);
    return GradeResponseDto.fromEntity(grade);
  }

  @Delete('courses/:courseId/interns/:internId/grade')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<void> {
    await this.gradeService.reset(internId, courseId);
  }
}
