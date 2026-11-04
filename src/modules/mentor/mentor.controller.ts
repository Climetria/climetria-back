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
  Patch,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { MentorResponseDto } from './dto/mentor-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { AuthService } from '../auth/auth.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MentorController {
  constructor(
    private readonly mentorService: MentorService,
    private readonly authService: AuthService,
  ) {}

  @Get('mentors')
  async findAll(): Promise<MentorResponseDto[]> {
    const mentors = await this.mentorService.findAll();
    return mentors.map((m) => MentorResponseDto.fromEntity(m));
  }

  @Get('mentors/:mentorId')
  async findOne(
    @Param('mentorId') mentorId: string,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.findOne(mentorId);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Post('mentors')
  async create(@Body() dto: CreateMentorDto): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.create(dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Patch('mentors/:mentorId')
  async update(
    @Param('mentorId') mentorId: string,
    @Body() dto: UpdateMentorDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.update(mentorId, dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Delete('mentors/:mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('mentorId') mentorId: string): Promise<void> {
    await this.mentorService.softDelete(mentorId);
  }

  @Get('courses/:courseId/mentors')
  async findAllByCourse(
    @Param('courseId') courseId: string,
  ): Promise<MentorResponseDto[]> {
    const mentors = await this.mentorService.findAllByCourse(courseId);
    return mentors.map((m) => MentorResponseDto.fromEntity(m));
  }

  @Get('courses/:courseId/mentors/:mentorId')
  async findOneByCourse(
    @Param('courseId') courseId: string,
    @Param('mentorId') mentorId: string,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.findOneByCourse(courseId, mentorId);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Post('courses/:courseId/mentors')
  async createInCourse(
    @Param('courseId') courseId: string,
    @Body() dto: CreateMentorDto,
  ): Promise<MentorResponseDto> {
    const authUserId = await this.authService.createOrGetAuthUser(
      dto.email,
      'mentor',
    );
    dto.authUserId = authUserId;
    const mentor = await this.mentorService.createInCourse(courseId, dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Patch('courses/:courseId/mentors/:mentorId')
  async updateInCourse(
    @Param('mentorId') mentorId: string,
    @Body() dto: UpdateMentorDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.update(mentorId, dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Delete('courses/:courseId/mentors/:mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteInCourse(@Param('mentorId') mentorId: string): Promise<void> {
    await this.mentorService.softDelete(mentorId);
  }

  @Get('courses/:courseId/organizations/:organizationId/mentors')
  async findAllByCourseAndOrganization(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
  ): Promise<MentorResponseDto[]> {
    const mentors = await this.mentorService.findAllByCourseAndOrganization(
      courseId,
      organizationId,
    );
    return mentors.map((m) => MentorResponseDto.fromEntity(m));
  }

  @Patch('courses/:courseId/organizations/:organizationId/mentors/:mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addOrganizationAssignmentFromCourse(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
    @Param('mentorId') mentorId: string,
  ): Promise<void> {
    await this.mentorService.addOrganizationAssignmentFromCourse(
      courseId,
      organizationId,
      mentorId,
    );
  }

  @Delete('courses/:courseId/organizations/:organizationId/mentors/:mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOrganizationAssignmentFromCourse(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
    @Param('mentorId') mentorId: string,
  ): Promise<void> {
    await this.mentorService.removeOrganizationAssignmentFromCourse(
      courseId,
      organizationId,
      mentorId,
    );
  }
}
