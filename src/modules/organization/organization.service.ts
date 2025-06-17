import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from './entities/organization.entity';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const { courseIds, ...internData } = dto;

    try {
      const organization = await this.prisma.organization.create({
        data: {
          ...internData,
          organizationCourses:
            courseIds && courseIds.length > 0
              ? {
                  createMany: {
                    data: courseIds.map((courseId) => ({ courseId })),
                  },
                }
              : undefined,
        },
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
        },
      });

      return Organization.fromPrisma(organization);
    } catch (error: any) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('The ruc or email is already registered.');
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the organization.',
      );
    }
  }

  async createInCourse(
    courseId: string,
    dto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.prisma.organization.findFirst({
      where: { ruc: dto.ruc },
      include: { organizationCourses: true },
    });

    if (organization) {
      const alreadyRelated = organization.organizationCourses.some(
        (relation) => relation.courseId === courseId,
      );

      if (alreadyRelated) {
        throw new ConflictException(
          'The organization is already registered and associated with this course.',
        );
      }

      await this.prisma.organizationCourse.create({
        data: {
          organizationId: organization.id,
          courseId: courseId,
        },
      });

      const updatedOrganization = await this.prisma.organization.findUnique({
        where: { id: organization.id },
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
        },
      });

      if (!updatedOrganization) {
        throw new InternalServerErrorException(
          'Unexpected error retrieving the updated organization.',
        );
      }

      return Organization.fromPrisma(updatedOrganization);
    }

    try {
      const newOrganization = await this.prisma.organization.create({
        data: {
          ...dto,
          organizationCourses: {
            create: { courseId },
          },
        },
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
        },
      });

      return Organization.fromPrisma(newOrganization);
    } catch (error: any) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('The ruc or email is already registered.');
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the organization.',
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
        },
      });

      return data.map((o) => Organization.fromPrisma(o));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations.',
      );
    }
  }

  async findAllByCourse(courseId: string): Promise<Organization[]> {
    try {
      const organizations = await this.prisma.organization.findMany({
        where: {
          organizationCourses: {
            some: { courseId },
          },
          deletedAt: null,
        },
        include: {
          organizationCourses: true,
          mentorAssignments: true,
          internAssignments: true,
        },
      });

      return organizations.map((o) => Organization.fromPrisma(o));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving organizations from the course.',
      );
    }
  }

  async findOne(organizationId: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationCourses: true,
        mentorAssignments: true,
        internAssignments: true,
      },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(
        'The organization does not exist or has been deleted.',
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
