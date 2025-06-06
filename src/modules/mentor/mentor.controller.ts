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
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { MentorResponseDto } from './dto/mentor-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateMentorDto } from './dto/update-mentor.dto';

@Controller('courses/:courseId/mentors')
@UseGuards(JwtAuthGuard)
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Get()
  async findAll(
    @Param('courseId') courseId: string,
  ): Promise<MentorResponseDto[]> {
    const mentors = await this.mentorService.findAllByCourse(courseId);
    return mentors.map((m) => MentorResponseDto.fromEntity(m));
  }

  @Get(':mentorId')
  async findOne(
    @Param('courseId') courseId: string,
    @Param('mentorId') mentorId: string,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.findOne(courseId, mentorId);

    if (!mentor) {
      throw new NotFoundException(
        `Mentor with ID ${mentorId} in course ${courseId} not found`,
      );
    }

    return MentorResponseDto.fromEntity(mentor);
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateMentorDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.create(courseId, dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Patch(':mentorId')
  async update(
    @Param('courseId') courseId: string,
    @Param('mentorId') mentorId: string,
    @Body() dto: UpdateMentorDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.update(courseId, mentorId, dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Delete(':mentorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param('courseId') courseId: string,
    @Param('mentorId') mentorId: string,
  ): Promise<void> {
    await this.mentorService.softDelete(courseId, mentorId);
  }
}
