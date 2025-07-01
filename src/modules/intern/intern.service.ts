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
import { Gender, Prisma } from '@prisma/client';
import { BatchCreateInternDto } from './dto/batch-create-intern.dto';
import { InternResponseDto } from './dto/intern-response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class InternService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInternDto): Promise<Intern> {
    try {
      const intern = await this.prisma.intern.create({ data: dto });

      return Intern.fromPrisma(intern);
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

  async createInCourse(
    courseId: string,
    dto: CreateInternDto,
  ): Promise<Intern> {
    const existingIntern = await this.prisma.intern.findFirst({
      where: { document: dto.document },
      include: { internCourses: true, grades: true },
    });

    if (existingIntern) {
      const alreadyRelated = existingIntern.internCourses.some(
        (relation) => relation.courseId === courseId,
      );

      if (alreadyRelated) {
        throw new ConflictException(
          'The intern is already registered and associated with this course.',
        );
      }

      await this.prisma.internCourse.create({
        data: {
          internId: existingIntern.id,
          courseId,
        },
      });

      const existingGrade = await this.prisma.grade.findUnique({
        where: {
          internId_courseId: {
            internId: existingIntern.id,
            courseId,
          },
        },
      });

      if (!existingGrade) {
        await this.prisma.grade.create({
          data: {
            internId: existingIntern.id,
            courseId,
          },
        });
      }

      const updatedIntern = await this.prisma.intern.findUnique({
        where: { id: existingIntern.id },
        include: {
          internCourses: true,
          internAssignments: true,
          grades: true,
        },
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
          grades: {
            create: {
              courseId,
            },
          },
        },
        include: {
          internCourses: true,
          internAssignments: true,
          grades: true,
        },
      });

      return Intern.fromPrisma(newIntern);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
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

  private async batchParseAndValidateCsv(csvContent: string): Promise<{
    validInterns: BatchCreateInternDto[];
    invalidRows: InvalidCsvRow[];
  }> {
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

    const createInternsData = validRows.map((r) => r.row);

    return {
      validInterns: createInternsData,
      invalidRows,
    };
  }

  async batchCreateFromCsv(
    csvContent: string,
  ): Promise<CsvUploadInternResponseDto> {
    const baseResult = await this.batchParseAndValidateCsv(csvContent);

    const responseInterns: InternResponseDto[] = [];

    for (const internData of baseResult.validInterns) {
      try {
        const exists = await this.prisma.intern.findFirst({
          where: {
            OR: [
              { email: internData.email },
              { document: internData.document },
            ],
          },
          include: {
            internCourses: true,
            internAssignments: true,
            grades: true,
          },
        });

        if (exists) {
          const domain = Intern.fromPrisma(exists);
          const dto = InternResponseDto.fromEntity(domain);
          responseInterns.push(dto);
          continue;
        }

        const created = await this.prisma.intern.create({
          data: internData,
          include: {
            internCourses: true,
            internAssignments: true,
            grades: true,
          },
        });

        const domainIntern = Intern.fromPrisma(created);
        const dto = InternResponseDto.fromEntity(domainIntern);
        responseInterns.push(dto);
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

    return {
      validInterns: responseInterns,
      invalidRows: baseResult.invalidRows,
    };
  }

  async batchCreateFromCsvInCourse(
    courseId: string,
    csvContent: string,
  ): Promise<CsvUploadInternResponseDto> {
    const baseResult = await this.batchParseAndValidateCsv(csvContent);

    type InternWithRelations = Prisma.InternGetPayload<{
      include: {
        internCourses: true;
        internAssignments: true;
        grades: true;
      };
    }>;

    const responseInterns: InternResponseDto[] = [];

    for (const internData of baseResult.validInterns) {
      try {
        const existing: InternWithRelations | null =
          await this.prisma.intern.findFirst({
            where: {
              OR: [
                { email: internData.email },
                { document: internData.document },
              ],
            },
            include: {
              internCourses: true,
              internAssignments: true,
              grades: true,
            },
          });

        let intern: InternWithRelations;

        if (!existing) {
          intern = await this.prisma.intern.create({
            data: {
              ...internData,
              internCourses: {
                create: [{ courseId }],
              },
            },
            include: {
              internCourses: true,
              internAssignments: true,
              grades: true,
            },
          });
        } else {
          intern = existing;

          const alreadyRelated = intern.internCourses.some(
            (relation) => relation.courseId === courseId,
          );

          if (!alreadyRelated) {
            await this.prisma.internCourse.create({
              data: { internId: intern.id, courseId },
            });

            intern = (await this.prisma.intern.findUnique({
              where: { id: intern.id },
              include: {
                internCourses: true,
                internAssignments: true,
                grades: true,
              },
            })) as InternWithRelations;
          }
        }

        const domain = Intern.fromPrisma(intern);
        const dto = InternResponseDto.fromEntity(domain);
        responseInterns.push(dto);
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
      validInterns: responseInterns,
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

  async findMatchingForOrganization(
    courseId: string,
    organizationId: string,
  ): Promise<Intern[]> {
    const orgCourse = await this.prisma.organizationCourse.findUnique({
      where: {
        organizationId_courseId: {
          organizationId,
          courseId,
        },
      },
    });

    if (!orgCourse) {
      throw new NotFoundException(
        'OrganizationCourse not found for this organization and course.',
      );
    }

    const { studiedMajorFilter, genderFilter, placeOfResidenceFilter } =
      orgCourse;

    let genderValues: Gender[] | undefined;
    switch (genderFilter) {
      case 'MALE_ONLY':
        genderValues = ['MALE'];
        break;
      case 'FEMALE_ONLY':
        genderValues = ['FEMALE'];
        break;
      case 'BOTH':
        genderValues = ['MALE', 'FEMALE', 'I_PREFER_NOT_TO_SAY_IT'];
        break;
    }

    const interns = await this.prisma.intern.findMany({
      where: {
        deletedAt: null,
        internCourses: {
          some: { courseId },
        },
        internAssignments: {
          none: {
            organizationId,
            courseId,
          },
        },
        ...(studiedMajorFilter &&
          studiedMajorFilter.length > 0 && {
            majorInProgress: { in: studiedMajorFilter },
          }),
        ...(genderValues && {
          gender: { in: genderValues },
        }),
        ...(placeOfResidenceFilter && {
          peruDepartment: placeOfResidenceFilter,
        }),
      },
      include: {
        internCourses: true,
        internAssignments: true,
      },
    });

    return interns.map((i) => Intern.fromPrisma(i));
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
