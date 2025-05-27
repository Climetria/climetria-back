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
import { InternService } from './intern.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { InternResponseDto } from './dto/intern-response.dto';

@Controller('interns')
export class InternController {
  constructor(private readonly internService: InternService) {}

  @Post()
  async create(@Body() dto: CreateInternDto): Promise<InternResponseDto> {
    const intern = await this.internService.create(dto);
    return InternResponseDto.fromEntity(intern);
  }

  @Get()
  async findAll(): Promise<InternResponseDto[]> {
    const interns = await this.internService.findAll();
    return interns.map(InternResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InternResponseDto> {
    const intern = await this.internService.findOne(id);
    return InternResponseDto.fromEntity(intern);
  }
}
