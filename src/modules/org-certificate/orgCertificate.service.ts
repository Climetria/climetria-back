import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateOrgCertificateDto } from './dto/create-orgCertificate.dto';
import { OrgCertificate } from './entities/orgCertificate.entity';
import { UpdateOrgCertificateDto } from './dto/update-orgCertificate.dto';

@Injectable()
export class OrgCertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createOrgCertificate(
    courseId: string,
    dto: CreateOrgCertificateDto,
    logoFile?: Express.Multer.File,
    signatureFile?: Express.Multer.File,
  ): Promise<OrgCertificate> {
    const existing = await this.prisma.organizationCertificate.findUnique({
      where: { name: dto.name },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'A Organization with this name already exists.',
      );
    }

    const created = await this.prisma.organizationCertificate.create({
      data: {
        ...dto,
        logoUrl: logoFile
          ? await this.s3Service.uploadFile(logoFile, 'logos')
          : undefined,
        signerSignatureUrl: signatureFile
          ? await this.s3Service.uploadFile(signatureFile, 'signatures')
          : undefined,
        orgCertificateCourses: {
          create: { courseId },
        },
      },
      include: { orgCertificateCourses: true },
    });

    return OrgCertificate.fromPrisma(created);
  }

  async findAll(): Promise<OrgCertificate[]> {
    try {
      const data = await this.prisma.organizationCertificate.findMany({
        where: { deletedAt: null },
        include: {
          orgCertificateCourses: true,
        },
      });

      return data.map((oc) => OrgCertificate.fromPrisma(oc));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations.',
      );
    }
  }

  async findAllByCourse(courseId: string): Promise<OrgCertificate[]> {
    try {
      const organizations = await this.prisma.organizationCertificate.findMany({
        where: {
          orgCertificateCourses: {
            some: { courseId },
          },
          deletedAt: null,
        },
        include: { orgCertificateCourses: true },
      });

      return organizations.map((oc) => OrgCertificate.fromPrisma(oc));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations from the course.',
      );
    }
  }

  async findAllExcludingCourse(courseId: string): Promise<OrgCertificate[]> {
    try {
      const data = await this.prisma.organizationCertificate.findMany({
        where: {
          orgCertificateCourses: {
            none: { courseId },
          },
        },
        include: {
          orgCertificateCourses: true,
        },
      });

      return data.map((oc) => OrgCertificate.fromPrisma(oc));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations.',
      );
    }
  }

  async findOne(orgCertificateId: string): Promise<OrgCertificate> {
    const organization = await this.prisma.organizationCertificate.findUnique({
      where: { id: orgCertificateId },
      include: {
        orgCertificateCourses: true,
      },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(
        'The organization does not exist or has been deleted.',
      );
    }

    return OrgCertificate.fromPrisma(organization);
  }

  async assignToCourse(
    courseId: string,
    orgCertificateId: string,
  ): Promise<OrgCertificate> {
    try {
      const orgCertificate =
        await this.prisma.organizationCertificate.findUnique({
          where: { id: orgCertificateId },
          include: { orgCertificateCourses: true },
        });

      if (!orgCertificate || orgCertificate.deletedAt) {
        throw new NotFoundException(
          'The orgCertificate does not exist or has been deleted.',
        );
      }

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || course.deletedAt) {
        throw new NotFoundException(
          'The course does not exist or has been deleted.',
        );
      }

      const existing =
        await this.prisma.organizationCertificateCourse.findUnique({
          where: {
            orgCertificateId_courseId: {
              orgCertificateId,
              courseId,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          'This orgCertificate is already linked to the course.',
        );
      }

      const relation = await this.prisma.organizationCertificateCourse.create({
        data: {
          orgCertificateId,
          courseId,
        },
        include: {
          orgCertificate: true,
          course: true,
        },
      });

      const updatedOrgCertificate = {
        ...orgCertificate,
        orgCertificateCourses: [
          ...orgCertificate.orgCertificateCourses,
          relation,
        ],
      };

      return OrgCertificate.fromPrisma(updatedOrgCertificate);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while assigning the orgCertificate to the course.',
      );
    }
  }

  async unassignFromCourse(
    courseId: string,
    orgCertificateId: string,
  ): Promise<OrgCertificate> {
    try {
      const orgCertificate =
        await this.prisma.organizationCertificate.findUnique({
          where: { id: orgCertificateId },
          include: { orgCertificateCourses: true },
        });

      if (!orgCertificate || orgCertificate.deletedAt) {
        throw new NotFoundException(
          'The orgCertificate does not exist or has been deleted.',
        );
      }

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || course.deletedAt) {
        throw new NotFoundException(
          'The course does not exist or has been deleted.',
        );
      }

      const existing =
        await this.prisma.organizationCertificateCourse.findUnique({
          where: {
            orgCertificateId_courseId: {
              orgCertificateId,
              courseId,
            },
          },
        });

      if (!existing) {
        throw new NotFoundException(
          'This orgCertificate is not linked to the specified course.',
        );
      }

      await this.prisma.organizationCertificateCourse.delete({
        where: { id: existing.id },
      });

      const updatedOrgCertificate = {
        ...orgCertificate,
        orgCertificateCourses: orgCertificate.orgCertificateCourses.filter(
          (rel) => rel.courseId !== courseId,
        ),
      };

      return OrgCertificate.fromPrisma(updatedOrgCertificate);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while unassigning the orgCertificate from the course.',
      );
    }
  }

  async update(
    orgCertificateId: string,
    dto: UpdateOrgCertificateDto,
    logoFile?: Express.Multer.File,
    signatureFile?: Express.Multer.File,
  ): Promise<OrgCertificate> {
    try {
      const orgCertificate =
        await this.prisma.organizationCertificate.findUnique({
          where: { id: orgCertificateId },
        });

      if (!orgCertificate || orgCertificate.deletedAt) {
        throw new NotFoundException(
          'The orgCertificate does not exist or has been deleted.',
        );
      }

      let logoUrl = orgCertificate.logoUrl;
      let signerSignatureUrl = orgCertificate.signerSignatureUrl;

      if (logoFile) {
        logoUrl = await this.s3Service.uploadFile(
          logoFile,
          `org-certificates/${orgCertificateId}/logo-${Date.now()}`,
        );
      }

      if (signatureFile) {
        signerSignatureUrl = await this.s3Service.uploadFile(
          signatureFile,
          `org-certificates/${orgCertificateId}/signature-${Date.now()}`,
        );
      }

      const updated = await this.prisma.organizationCertificate.update({
        where: { id: orgCertificateId },
        data: {
          ...dto,
          logoUrl,
          signerSignatureUrl,
        },
      });

      return OrgCertificate.fromPrisma(updated);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while updating the orgCertificate.',
      );
    }
  }

  async softDelete(orgCertificateId: string): Promise<void> {
    const existingOrganization =
      await this.prisma.organizationCertificate.findUnique({
        where: { id: orgCertificateId },
      });

    if (!existingOrganization || existingOrganization.deletedAt) {
      throw new NotFoundException(
        'The organization does not exist or has already been deleted.',
      );
    }

    try {
      await this.prisma.organizationCertificate.update({
        where: { id: orgCertificateId },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while deleting the organization.',
      );
    }
  }
}
