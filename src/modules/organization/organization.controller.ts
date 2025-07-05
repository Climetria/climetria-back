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
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  CreateOrganizationFilterDto,
} from './dto/create-organization.dto';
import {
  OrganizationFilterResponseDto,
  OrganizationResponseDto,
} from './dto/organization-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('organizations')
  async findAll(): Promise<OrganizationResponseDto[]> {
    const organizations = await this.organizationService.findAll();
    return organizations.map((o) => OrganizationResponseDto.fromEntity(o));
  }

  @Get('organizations/:organizationId')
  async findOne(
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.findOne(organizationId);
    return OrganizationResponseDto.fromEntity(organization);
  }

  @Get('organizations/ruc/:ruc')
  async findOneByRuc(
    @Param('ruc') ruc: string,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.findOneByRuc(ruc);
    return OrganizationResponseDto.fromEntity(organization);
  }

  @Post('organizations')
  async create(
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const intern = await this.organizationService.create(dto);
    return OrganizationResponseDto.fromEntity(intern);
  }

  @Patch('organizations/:organizationId')
  async update(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.update(
      organizationId,
      dto,
    );
    return OrganizationResponseDto.fromEntity(organization);
  }

  @Delete('organizations/:organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param('organizationId') organizationId: string,
  ): Promise<void> {
    await this.organizationService.softDelete(organizationId);
  }

  @Get('courses/:courseId/organizations')
  async findAllByCourse(@Param('courseId') courseId: string): Promise<
    {
      organization: OrganizationResponseDto;
      filter: OrganizationFilterResponseDto;
    }[]
  > {
    const results = await this.organizationService.findAllByCourse(courseId);

    return results.map(({ organization, filter }) => ({
      organization: OrganizationResponseDto.fromEntity(organization),
      filter: OrganizationFilterResponseDto.fromEntity(filter),
    }));
  }

  @Get('courses/:courseId/organizations/:organizationId')
  async findOneByCourse(
    @Param('courseId') courseId: string,
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.findOneByCourse(
      courseId,
      organizationId,
    );
    return OrganizationResponseDto.fromEntity(organization);
  }

  @Post('courses/:courseId/organizations')
  async createInCourseWithFilter(
    @Param('courseId') courseId: string,
    @Body()
    body: {
      organization: CreateOrganizationDto;
      filter: CreateOrganizationFilterDto;
    },
  ): Promise<{
    organization: OrganizationResponseDto;
    filter: OrganizationFilterResponseDto;
  }> {
    const { organization, filter } = body;

    const result = await this.organizationService.createInCourseWithFilter(
      courseId,
      organization,
      filter,
    );

    return {
      organization: OrganizationResponseDto.fromEntity(result.organization),
      filter: OrganizationFilterResponseDto.fromEntity(result.filter),
    };
  }

  @Patch('courses/:courseId/organizations/:organizationId')
  async updateInCourse(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.update(
      organizationId,
      dto,
    );
    return OrganizationResponseDto.fromEntity(organization);
  }

  @Delete('courses/:courseId/organizations/:organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteInCourse(
    @Param('organizationId') organizationId: string,
  ): Promise<void> {
    await this.organizationService.softDelete(organizationId);
  }
}
