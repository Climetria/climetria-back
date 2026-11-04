import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsUserAdmin, JwtPayload, JwtUser } from '../auth/auth.decorator';
import { Roles } from '../auth/roles.decorator';
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

  @Get('mentor/:mentorAuthUserId/grades')
  @Roles('admin', 'mentor')
  async findByMentor(
    @Param('mentorAuthUserId') mentorAuthUserId: string,
    @JwtUser() user: JwtPayload,
    @IsUserAdmin() isAdmin: boolean,
  ): Promise<GradeResponseDto[]> {
    // Un mentor solo puede ver sus propias notas
    if (!isAdmin && user.sub !== mentorAuthUserId) {
      throw new ForbiddenException('Solo puedes ver tus propias notas');
    }
    const grades = await this.gradeService.findAllByMentor(mentorAuthUserId);
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('courses/:courseId/grades')
  async findAllForCourse(
    @Param('courseId') courseId: string,
  ): Promise<GradeResponseDto[]> {
    const grades = await this.gradeService.findAllByCourse(courseId);
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('interns/:internId/grades')
  async findForIntern(
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto[]> {
    const grades = await this.gradeService.findAllByIntern(internId);
    return grades.map((g) => GradeResponseDto.fromEntity(g));
  }

  @Get('courses/:courseId/interns/:internId/grade')
  async findForCourseAndIntern(
    @Param('courseId') courseId: string,
    @Param('internId') internId: string,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradeService.findByCourseAndIntern(
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

  @Patch('grades/:gradeId')
  @Roles('admin', 'mentor')
  async updateByGrade(
    @Param('gradeId') gradeId: string,
    @Body() dto: UpdateGradeDto,
    @JwtUser() user: JwtPayload,
    @IsUserAdmin() isAdmin: boolean,
  ): Promise<GradeResponseDto> {
    // Un mentor solo puede calificar a los practicantes que tiene asignados
    if (
      !isAdmin &&
      !(await this.gradeService.isGradedByMentor(gradeId, user.sub))
    ) {
      throw new ForbiddenException('Solo puedes editar tus propias notas');
    }
    const grade = await this.gradeService.updateByGrade(gradeId, dto);
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
