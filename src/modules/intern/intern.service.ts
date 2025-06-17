import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInternDto } from './dto/create-intern.dto';
import { Intern } from './entities/intern.entity';
import { UpdateInternDto } from './dto/update-intern.dto';
import { validateParsedRows } from './utils/intern-csv-validator.utils';
import {
  CsvUploadInternResponseDto,
  InvalidCsvRow,
} from './dto/csv-upload-intern-response.dto';
import {
  parseCsvContent,
  ParsedRowResult,
} from './utils/intern-csv-parser.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class InternService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInternDto): Promise<Intern> {
    const { courseIds, ...internData } = dto;

    try {
      const intern = await this.prisma.intern.create({
        data: {
          ...internData,
          internCourses:
            courseIds && courseIds.length > 0
              ? {
                  createMany: {
                    data: courseIds.map((courseId) => ({ courseId })),
                  },
                }
              : undefined,
        },
        include: {
          internCourses: true,
          internAssignments: true,
        },
      });

      return Intern.fromPrisma(intern);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The document or email is already registered.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the intern.',
      );
    }
  }

  async createInCourse(
    courseId: string,
    dto: CreateInternDto,
  ): Promise<Intern> {
    const intern = await this.prisma.intern.findFirst({
      where: { document: dto.document },
      include: { internCourses: true },
    });

    if (intern) {
      const alreadyRelated = intern.internCourses.some(
        (relation) => relation.courseId === courseId,
      );

      if (alreadyRelated) {
        throw new ConflictException(
          'The intern is already registered and associated with this course.',
        );
      }

      await this.prisma.internCourse.create({
        data: {
          internId: intern.id,
          courseId: courseId,
        },
      });

      const updatedIntern = await this.prisma.intern.findUnique({
        where: { id: intern.id },
        include: { internCourses: true, internAssignments: true },
      });

      if (!updatedIntern) {
        throw new InternalServerErrorException(
          'Unexpected error retrieving the updated intern.',
        );
      }

      return Intern.fromPrisma(updatedIntern);
    }

    try {
      const newIntern = await this.prisma.intern.create({
        data: {
          ...dto,
          internCourses: {
            create: { courseId },
          },
        },
        include: { internCourses: true, internAssignments: true },
      });

      return Intern.fromPrisma(newIntern);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The document or email is already registered.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the intern.',
      );
    }
  }

  async batchParseAndValidateCsv(
    csvContent: string,
  ): Promise<CsvUploadInternResponseDto> {
    let parsedRows: ParsedRowResult[] = parseCsvContent(csvContent);

    const existingInterns = await this.prisma.intern.findMany({
      select: { email: true, document: true },
    });

    const existingEmails = new Set(existingInterns.map((i) => i.email));
    const existingDocuments = new Set(existingInterns.map((i) => i.document));

    parsedRows = await validateParsedRows(
      parsedRows,
      existingEmails,
      existingDocuments,
    );

    const validRows = parsedRows.filter((r) => r.errors.length === 0);
    const invalidRows: InvalidCsvRow[] = parsedRows
      .filter((r) => r.errors.length > 0)
      .map((r) => ({
        rowNumber: parsedRows.indexOf(r) + 2,
        errors: r.errors,
        rawData: r.originalRow,
      }));

    const createInternsData = validRows.map((r) => ({
      ...r.row,
    }));

    return {
      validInterns: createInternsData,
      invalidRows,
    };
  }

  async batchCreateFromCsv(
    csvContent: string,
  ): Promise<CsvUploadInternResponseDto> {
    const baseResult = await this.batchParseAndValidateCsv(csvContent);

    for (const internData of baseResult.validInterns) {
      try {
        const exists = await this.prisma.intern.findFirst({
          where: {
            OR: [
              { email: internData.email },
              { document: internData.document },
            ],
          },
        });

        if (exists) {
          continue;
        }

        await this.prisma.intern.create({
          data: internData,
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'The document or email is already registered.',
          );
        }

        throw new InternalServerErrorException(
          'An error occurred while creating the intern.',
        );
      }
    }

    return baseResult;
  }

  async batchCreateFromCsvInCourse(
    courseId: string,
    csvContent: string,
  ): Promise<CsvUploadInternResponseDto> {
    const baseResult = await this.batchParseAndValidateCsv(csvContent);

    for (const internData of baseResult.validInterns) {
      try {
        const intern = await this.prisma.intern.findFirst({
          where: {
            OR: [
              { email: internData.email },
              { document: internData.document },
            ],
          },
          include: { internCourses: true },
        });

        if (!intern) {
          await this.prisma.intern.create({
            data: {
              ...internData,
              internCourses: {
                create: [{ courseId }],
              },
            },
          });
        } else {
          const alreadyRelated = intern.internCourses.some(
            (relation) => relation.courseId === courseId,
          );

          if (!alreadyRelated) {
            await this.prisma.internCourse.create({
              data: { internId: intern.id, courseId },
            });
          }
        }
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'The document or email is already registered.',
          );
        }
        throw new InternalServerErrorException(
          'An error occurred while creating the intern.',
        );
      }
    }

    return {
      validInterns: baseResult.validInterns,
      invalidRows: baseResult.invalidRows,
    };
  }

  async findAll(): Promise<Intern[]> {
    try {
      const data = await this.prisma.intern.findMany({
        where: { deletedAt: null },
        include: { internCourses: true, internAssignments: true },
      });

      return data.map((i) => Intern.fromPrisma(i));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving interns.',
      );
    }
  }

  async findAllByCourse(courseId: string): Promise<Intern[]> {
    try {
      const interns = await this.prisma.intern.findMany({
        where: {
          internCourses: {
            some: { courseId },
          },
          deletedAt: null,
        },
        include: { internCourses: true, internAssignments: true },
      });

      return interns.map((i) => Intern.fromPrisma(i));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving interns from the course.',
      );
    }
  }

  async findAllByCourseAndOrganization(
    courseId: string,
    organizationId: string,
  ): Promise<Intern[]> {
    try {
      const interns = await this.prisma.intern.findMany({
        where: {
          internAssignments: {
            some: { courseId, organizationId },
          },
          deletedAt: null,
        },
        include: { internCourses: true, internAssignments: true },
      });

      return interns.map((i) => Intern.fromPrisma(i));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving interns from the course and the organization',
      );
    }
  }

  async findOne(internId: string): Promise<Intern> {
    const intern = await this.prisma.intern.findUnique({
      where: { id: internId },
      include: {
        internCourses: true,
        internAssignments: true,
      },
    });

    if (!intern || intern.deletedAt) {
      throw new NotFoundException(
        'The intern does not exist or has been deleted.',
      );
    }

    return Intern.fromPrisma(intern);
  }

  async findOneByCourse(courseId: string, internId: string): Promise<Intern> {
    const intern = await this.prisma.intern.findFirst({
      where: {
        id: internId,
        internCourses: {
          some: { courseId },
        },
        deletedAt: null,
      },
      include: {
        internCourses: true,
        internAssignments: true,
      },
    });

    if (!intern) {
      throw new NotFoundException(
        'The intern is not registered in this course or does not exist.',
      );
    }

    return Intern.fromPrisma(intern);
  }

  async update(internId: string, dto: UpdateInternDto): Promise<Intern> {
    const existingIntern = await this.prisma.intern.findUnique({
      where: { id: internId },
      include: {
        internCourses: true,
        internAssignments: true,
      },
    });

    if (!existingIntern || existingIntern.deletedAt) {
      throw new NotFoundException('The intern does not exist.');
    }

    try {
      const updatedIntern = await this.prisma.intern.update({
        where: { id: internId },
        data: dto,
        include: {
          internCourses: true,
          internAssignments: true,
        },
      });

      return Intern.fromPrisma(updatedIntern);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The document or email is already registered.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the intern.',
      );
    }
  }

  async addOrganizationAssignmentFromCourse(
    courseId: string,
    organizationId: string,
    internId: string,
  ): Promise<void> {
    const intern = await this.prisma.intern.findUnique({
      where: { id: internId },
      include: { internCourses: true, internAssignments: true },
    });

    if (!intern) {
      throw new NotFoundException('Intern not found');
    }

    const alreadyAssigned = intern.internAssignments.some(
      (assignment) =>
        assignment.courseId === courseId &&
        assignment.organizationId === organizationId,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'The intern is already assigned to this organization in the specified course.',
      );
    }

    try {
      await this.prisma.internAssignment.create({
        data: {
          internId,
          organizationId,
          courseId,
        },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while assigning the intern to the organization.',
      );
    }
  }

  async removeOrganizationAssignmentFromCourse(
    courseId: string,
    organizationId: string,
    internId: string,
  ): Promise<void> {
    const assignment = await this.prisma.internAssignment.findFirst({
      where: {
        courseId,
        organizationId,
        internId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'The intern is not assigned to this organization in this course.',
      );
    }

    try {
      await this.prisma.internAssignment.delete({
        where: { id: assignment.id },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while removing the assignment.',
      );
    }
  }

  async softDelete(internId: string): Promise<void> {
    const existingIntern = await this.prisma.intern.findUnique({
      where: { id: internId },
    });

    if (!existingIntern || existingIntern.deletedAt) {
      throw new NotFoundException(
        'The intern does not exist or has already been deleted.',
      );
    }

    try {
      await this.prisma.intern.update({
        where: { id: internId },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while deleting the intern.',
      );
    }
  }
}
