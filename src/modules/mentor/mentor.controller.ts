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
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { MentorResponseDto } from './dto/mentor-response.dto';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  async create(@Body() dto: CreateMentorDto): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.create(dto);
    return MentorResponseDto.fromEntity(mentor);
  }

  @Get()
  async findAll(): Promise<MentorResponseDto[]> {
    const mentors = await this.mentorService.findAll();
    return mentors.map(MentorResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MentorResponseDto> {
    const mentor = await this.mentorService.findOne(id);
    return MentorResponseDto.fromEntity(mentor);
  }
}
