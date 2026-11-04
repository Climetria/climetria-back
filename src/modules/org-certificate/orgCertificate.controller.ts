import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OrgCertificateService } from './orgCertificate.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateOrgCertificateDto } from './dto/create-orgCertificate.dto';
import { OrgCertificateResponseDto } from './dto/orgCertificate-response.dto';
import { UpdateOrgCertificateDto } from './dto/update-orgCertificate.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrgCertificateController {
  constructor(private readonly orgCertificateService: OrgCertificateService) {}

  @Get('org-certificates')
  async findAll(): Promise<OrgCertificateResponseDto[]> {
    const organizations = await this.orgCertificateService.findAll();
    return organizations.map((oc) => OrgCertificateResponseDto.fromEntity(oc));
  }

  @Get('courses/:courseId/org-certificates')
  async findAllByCourse(
    @Param('courseId') courseId: string,
  ): Promise<OrgCertificateResponseDto[]> {
    const organizations =
      await this.orgCertificateService.findAllByCourse(courseId);
    return organizations.map((oc) => OrgCertificateResponseDto.fromEntity(oc));
  }

  @Get('courses/:courseId/org-certificates/excluding-course')
  async findAllExcludingCourse(
    @Param('courseId') courseId: string,
  ): Promise<OrgCertificateResponseDto[]> {
    const organizations =
      await this.orgCertificateService.findAllExcludingCourse(courseId);
    return organizations.map((oc) => OrgCertificateResponseDto.fromEntity(oc));
  }

  @Get('org-certificates/:orgCertificateId')
  async findOne(
    @Param('internId') internId: string,
  ): Promise<OrgCertificateResponseDto> {
    const organization = await this.orgCertificateService.findOne(internId);
    return OrgCertificateResponseDto.fromEntity(organization);
  }

  @Post('courses/:courseId/org-certificates')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'signature', maxCount: 1 },
    ]),
  )
  async createOrgCertificate(
    @Param('courseId') courseId: string,
    @Body() dto: CreateOrgCertificateDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      signature?: Express.Multer.File[];
    },
  ): Promise<OrgCertificateResponseDto> {
    const logoFile = files.logo?.[0];
    const signatureFile = files.signature?.[0];

    const orgCertificate =
      await this.orgCertificateService.createOrgCertificate(
        courseId,
        dto,
        logoFile,
        signatureFile,
      );

    return OrgCertificateResponseDto.fromEntity(orgCertificate);
  }

  @Patch('courses/:courseId/org-certificates/:orgCertificateId')
  async assignToCourse(
    @Param('courseId') courseId: string,
    @Param('orgCertificateId') orgCertificateId: string,
  ): Promise<OrgCertificateResponseDto> {
    const organization = await this.orgCertificateService.assignToCourse(
      courseId,
      orgCertificateId,
    );
    return OrgCertificateResponseDto.fromEntity(organization);
  }

  @Delete('courses/:courseId/org-certificates/:orgCertificateId')
  async unassignFromCourse(
    @Param('courseId') courseId: string,
    @Param('orgCertificateId') orgCertificateId: string,
  ): Promise<OrgCertificateResponseDto> {
    const organization = await this.orgCertificateService.unassignFromCourse(
      courseId,
      orgCertificateId,
    );
    return OrgCertificateResponseDto.fromEntity(organization);
  }

  @Patch('org-certificates/:orgCertificateId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'signature', maxCount: 1 },
    ]),
  )
  async updateOrgCertificate(
    @Param('orgCertificateId') orgCertificateId: string,
    @Body() dto: UpdateOrgCertificateDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      signature?: Express.Multer.File[];
    },
  ): Promise<OrgCertificateResponseDto> {
    const logoFile = files.logo?.[0];
    const signatureFile = files.signature?.[0];

    const updated = await this.orgCertificateService.update(
      orgCertificateId,
      dto,
      logoFile,
      signatureFile,
    );

    return OrgCertificateResponseDto.fromEntity(updated);
  }

  @Delete('org-certificates/:orgCertificateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param('orgCertificateId') orgCertificateId: string,
  ): Promise<void> {
    await this.orgCertificateService.softDelete(orgCertificateId);
  }
}
