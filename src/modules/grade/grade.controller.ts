import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeResponseDto } from './dto/grade-response.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Controller()
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('courses/:courseId/interns/:internId/grade')
  async findForIntern(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradeService.findForIntern(courseId, internId);
    return GradeResponseDto.fromEntity(grade);
  }

  @Post('courses/:courseId/interns/:internId/grade')
  async createInCourse(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradeService.createGrade(courseId, internId);
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
}
