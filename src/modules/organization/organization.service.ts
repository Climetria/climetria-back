import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateOrganizationDto,
  CreateOrganizationFilterDto,
} from './dto/create-organization.dto';
import { Organization } from './entities/organization.entity';
import {
  UpdateOrganizationCertificateInfoDto,
  UpdateOrganizationDto,
} from './dto/update-organization.dto';
import { OrganizationFilter } from './entities/organization-filter.entity';
import { Prisma } from '@prisma/client';
import {
  parseAndValidateOrganizationCsv,
  RawOrganizationCsvRow,
} from './utils/organization-csv-parser.utils';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    try {
      const organization = await this.prisma.organization.create({ data: dto });

      return Organization.fromPrisma(organization);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('The RUC or email is already registered.');
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the organization.',
      );
    }
  }

  async createInCourseWithFilter(
    courseId: string,
    organizationDto: CreateOrganizationDto,
    filterDto: CreateOrganizationFilterDto,
  ): Promise<{ organization: Organization; filter: OrganizationFilter }> {
    try {
      const organization = await this.prisma.organization.create({
        data: organizationDto,
      });

      const existing = await this.prisma.organizationCourse.findUnique({
        where: {
          organizationId_courseId: {
            organizationId: organization.id,
            courseId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'This organization is already linked to the course.',
        );
      }

      const filter = await this.prisma.organizationCourse.create({
        data: {
          ...filterDto,
          courseId,
          organizationId: organization.id,
        },
        include: {
          organization: true,
          course: true,
        },
      });

      return {
        organization: Organization.fromPrisma({
          ...organization,
          organizationCourses: [filter],
        }),
        filter: OrganizationFilter.fromPrisma(filter),
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('The ruc or email is already registered.');
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the organization with its filter.',
      );
    }
  }

  async batchCreateFromCsv(rawRows: RawOrganizationCsvRow[]): Promise<{
    successes: { organization: Organization; status: 'created' }[];
    failures: { row: number; errors: string[] }[];
  }> {
    const successes: { organization: Organization; status: 'created' }[] = [];
    const failures: { row: number; errors: string[] }[] = [];

    const parsedResults = parseAndValidateOrganizationCsv(rawRows, false);

    for (const result of parsedResults) {
      const { dto, errors, row } = result;

      if (errors.length > 0 || !dto) {
        failures.push({ row, errors });
        continue;
      }

      try {
        const created = await this.prisma.organization.create({
          data: dto.organization,
        });

        successes.push({
          organization: Organization.fromPrisma(created),
          status: 'created',
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          failures.push({
            row,
            errors: ['El RUC o email ya está registrado.'],
          });
        } else {
          failures.push({
            row,
            errors: ['Error inesperado al crear la organización.'],
          });
        }
      }
    }

    return { successes, failures };
  }

  async batchCreateFromCsvInCourse(
    courseId: string,
    rawRows: RawOrganizationCsvRow[],
  ): Promise<{
    successes: {
      organization: Organization;
      filter: OrganizationFilter;
      status: 'created' | 'associated';
    }[];
    failures: { row: number; errors: string[] }[];
  }> {
    const successes: {
      organization: Organization;
      filter: OrganizationFilter;
      status: 'created' | 'associated';
    }[] = [];
    const failures: { row: number; errors: string[] }[] = [];

    const parsedResults = parseAndValidateOrganizationCsv(rawRows, true);

    for (const result of parsedResults) {
      const { dto, errors, row } = result;

      if (errors.length > 0 || !dto) {
        failures.push({ row, errors });
        continue;
      }

      const { organization, filter } = dto;

      try {
        const existing = await this.prisma.organization.findFirst({
          where: {
            OR: [{ ruc: organization.ruc }, { email: organization.email }],
          },
          include: {
            organizationCourses: true,
          },
        });

        if (existing) {
          const alreadyInCourse = existing.organizationCourses.some(
            (c) => c.courseId === courseId,
          );

          if (alreadyInCourse) {
            failures.push({
              row,
              errors: [
                'La organización ya está registrada y asociada a este curso.',
              ],
            });
            continue;
          }

          const courseFilter = await this.prisma.organizationCourse.create({
            data: {
              ...filter!,
              courseId,
              organizationId: existing.id,
            },
            include: { organization: true, course: true },
          });

          const updated = await this.prisma.organization.findUnique({
            where: { id: existing.id },
            include: { organizationCourses: true },
          });

          if (updated) {
            successes.push({
              organization: Organization.fromPrisma(updated),
              filter: OrganizationFilter.fromPrisma(courseFilter),
              status: 'associated',
            });
          } else {
            failures.push({
              row,
              errors: [
                'Error inesperado al actualizar la organización existente.',
              ],
            });
          }

          continue;
        }

        const created = await this.prisma.organization.create({
          data: {
            ...organization,
            organizationCourses: {
              create: {
                ...filter!,
                courseId,
              },
            },
          },
          include: {
            organizationCourses: {
              include: { organization: true, course: true },
            },
          },
        });

        const createdCourse = created.organizationCourses[0];

        successes.push({
          organization: Organization.fromPrisma(created),
          filter: OrganizationFilter.fromPrisma(createdCourse),
          status: 'created',
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          failures.push({
            row,
            errors: ['El RUC o email ya está registrado.'],
          });
        } else {
          failures.push({
            row,
            errors: ['Error inesperado durante la creación o asociación.'],
          });
        }
      }
    }

    return { successes, failures };
  }

  async assignToCourseWithFilter(
    courseId: string,
    organizationId: string,
    filterDto: CreateOrganizationFilterDto,
  ): Promise<{ organization: Organization; filter: OrganizationFilter }> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        include: { organizationCourses: true },
      });

      if (!organization || organization.deletedAt) {
        throw new NotFoundException(
          'The organization does not exist or has been deleted.',
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

      const existing = await this.prisma.organizationCourse.findUnique({
        where: {
          organizationId_courseId: {
            organizationId,
            courseId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'This organization is already linked to the course.',
        );
      }

      const filter = await this.prisma.organizationCourse.create({
        data: {
          ...filterDto,
          organizationId,
          courseId,
        },
        include: {
          organization: true,
          course: true,
        },
      });

      const updatedOrganization = {
        ...organization,
        organizationCourses: [...organization.organizationCourses, filter],
      };

      return {
        organization: Organization.fromPrisma(updatedOrganization),
        filter: OrganizationFilter.fromPrisma(filter),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This organization-course link already exists.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while assigning the organization to the course.',
      );
    }
  }

  async updateCertificateInfo(
    organizationId: string,
    dto: UpdateOrganizationCertificateInfoDto,
    logoFile?: Express.Multer.File,
    signatureFile?: Express.Multer.File,
  ): Promise<Organization> {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    if (!existingOrganization || existingOrganization.deletedAt) {
      throw new NotFoundException('The organization does not exist.');
    }

    const updates: Partial<
      UpdateOrganizationCertificateInfoDto & {
        logoUrl?: string;
        signerSignatureUrl?: string;
      }
    > = { ...dto };

    if (logoFile) {
      updates.logoUrl = await this.s3Service.uploadFile(logoFile, 'logos');
    }

    if (signatureFile) {
      updates.signerSignatureUrl = await this.s3Service.uploadFile(
        signatureFile,
        'signatures',
      );
    }

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: updates,
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    return Organization.fromPrisma(updated);
  }

  async findAll(): Promise<Organization[]> {
    try {
      const data = await this.prisma.organization.findMany({
        where: { deletedAt: null },
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
          grades: true,
        },
      });

      return data.map((o) => Organization.fromPrisma(o));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations.',
      );
    }
  }

  async findAllByCourse(
    courseId: string,
  ): Promise<{ organization: Organization; filter: OrganizationFilter }[]> {
    const filters = await this.prisma.organizationCourse.findMany({
      where: {
        courseId,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: {
          include: {
            organizationCourses: true,
            mentorAssignments: true,
            internAssignments: true,
            grades: true,
          },
        },
        course: true,
      },
    });

    return filters.map((filter) => ({
      organization: Organization.fromPrisma({
        ...filter.organization,
        organizationCourses: [filter],
      }),
      filter: OrganizationFilter.fromPrisma(filter),
    }));
  }

  async findOne(organizationId: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(
        'The organization does not exist or has been deleted.',
      );
    }

    return Organization.fromPrisma(organization);
  }

  async findOneByRuc(ruc: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { ruc },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(
        'The organization with the provided RUC does not exist or has been deleted.',
      );
    }

    return Organization.fromPrisma(organization);
  }

  async findOneByCourse(
    courseId: string,
    organizationId: string,
  ): Promise<Organization> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        organizationCourses: {
          some: { courseId },
        },
        deletedAt: null,
      },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(
        'The organization is not registered in this course or does not exist.',
      );
    }

    return Organization.fromPrisma(organization);
  }

  async update(
    organizationId: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
        grades: true,
      },
    });

    if (!existingOrganization || existingOrganization.deletedAt) {
      throw new NotFoundException('The organization does not exist.');
    }

    try {
      const updatedIntern = await this.prisma.organization.update({
        where: { id: organizationId },
        data: dto,
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
          grades: true,
        },
      });

      return Organization.fromPrisma(updatedIntern);
    } catch (error: any) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'The ruc or email is already registered by another organization.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the organization.',
      );
    }
  }

  async softDelete(organizationId: string): Promise<void> {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!existingOrganization || existingOrganization.deletedAt) {
      throw new NotFoundException(
        'The organization does not exist or has already been deleted.',
      );
    }

    try {
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while deleting the organization.',
      );
    }
  }
}
