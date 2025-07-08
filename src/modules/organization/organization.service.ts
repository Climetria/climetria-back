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
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationFilter } from './entities/organization-filter.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

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
        'An error occurred while creating the intern.',
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
