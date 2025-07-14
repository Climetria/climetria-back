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
import { Gender, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  parseAndValidateCsv,
  RawInternCsvRow,
} from './utils/intern-csv-parser.utils';

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
      include: { internCourses: true, internAssignments: true, grades: true },
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

  async batchCreateFromCsv(rawRows: RawInternCsvRow[]): Promise<{
    successes: { intern: Intern; status: 'created' }[];
    failures: { row: number; errors: string[] }[];
  }> {
    const successes: { intern: Intern; status: 'created' }[] = [];
    const failures: { row: number; errors: string[] }[] = [];

    const parsedResults = parseAndValidateCsv(rawRows);

    for (const result of parsedResults) {
      const { dto, errors, row } = result;

      if (errors.length > 0 || !dto) {
        failures.push({ row, errors });
        continue;
      }

      try {
        const created = await this.prisma.intern.create({ data: dto });
        successes.push({
          intern: Intern.fromPrisma(created),
          status: 'created',
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          failures.push({
            row,
            errors: ['El documento o email ya está registrado.'],
          });
        } else {
          failures.push({
            row,
            errors: ['Error inesperado al crear el interno.'],
          });
        }
      }
    }

    return { successes, failures };
  }

  async batchCreateFromCsvInCourse(
    courseId: string,
    rawRows: RawInternCsvRow[],
  ): Promise<{
    successes: { intern: Intern; status: 'created' | 'associated' }[];
    failures: { row: number; errors: string[] }[];
  }> {
    const successes: { intern: Intern; status: 'created' | 'associated' }[] =
      [];
    const failures: { row: number; errors: string[] }[] = [];

    const parsedResults = parseAndValidateCsv(rawRows);

    for (const result of parsedResults) {
      const { dto, errors, row } = result;

      if (errors.length > 0 || !dto) {
        failures.push({ row, errors });
        continue;
      }

      try {
        const existing = await this.prisma.intern.findFirst({
          where: { document: dto.document },
          include: {
            internCourses: true,
            grades: true,
            internAssignments: true,
          },
        });

        if (existing) {
          const alreadyInCourse = existing.internCourses.some(
            (c) => c.courseId === courseId,
          );

          if (alreadyInCourse) {
            failures.push({
              row,
              errors: [
                'El interno ya está registrado y asociado a este curso.',
              ],
            });
            continue;
          }

          await this.prisma.internCourse.create({
            data: {
              internId: existing.id,
              courseId,
            },
          });

          const hasGrade = existing.grades.some((g) => g.courseId === courseId);
          if (!hasGrade) {
            await this.prisma.grade.create({
              data: {
                internId: existing.id,
                courseId,
              },
            });
          }

          const updated = await this.prisma.intern.findUnique({
            where: { id: existing.id },
            include: {
              internCourses: true,
              grades: true,
              internAssignments: true,
            },
          });

          if (updated) {
            successes.push({
              intern: Intern.fromPrisma(updated),
              status: 'associated',
            });
          } else {
            failures.push({
              row,
              errors: ['Error inesperado al actualizar interno existente.'],
            });
          }

          continue;
        }

        const created = await this.prisma.intern.create({
          data: {
            ...dto,
            internCourses: { create: { courseId } },
            grades: { create: { courseId } },
          },
          include: {
            internCourses: true,
            grades: true,
            internAssignments: true,
          },
        });

        successes.push({
          intern: Intern.fromPrisma(created),
          status: 'created',
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          failures.push({
            row,
            errors: ['El documento o email ya está registrado.'],
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

  async findAll(): Promise<Intern[]> {
    try {
      const data = await this.prisma.intern.findMany({
        where: { deletedAt: null },
        include: { internCourses: true, internAssignments: true, grades: true },
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
        include: { internCourses: true, internAssignments: true, grades: true },
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
        include: { internCourses: true, internAssignments: true, grades: true },
      });

      return interns.map((i) => Intern.fromPrisma(i));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving interns from the course and the organization',
      );
    }
  }

  async findAllAvailableForCourse(courseId: string): Promise<Intern[]> {
    try {
      const data = await this.prisma.intern.findMany({
        where: {
          deletedAt: null,
          internCourses: {
            none: {
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

      return data.map((intern) => Intern.fromPrisma(intern));
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while retrieving interns not in the specified course.',
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
          none: { organizationId, courseId },
        },
        ...(studiedMajorFilter?.length
          ? { majorInProgress: { in: studiedMajorFilter } }
          : {}),
        ...(genderValues?.length ? { gender: { in: genderValues } } : {}),
        ...(placeOfResidenceFilter?.length
          ? { peruDepartment: { in: placeOfResidenceFilter } }
          : {}),
      },
      include: {
        internCourses: true,
        internAssignments: true,
        grades: true,
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
        grades: true,
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
        grades: true,
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
        grades: true,
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
          grades: true,
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

  async assignToCourse(courseId: string, internId: string): Promise<void> {
    const intern = await this.prisma.intern.findUnique({
      where: { id: internId },
    });

    if (!intern) {
      throw new NotFoundException('Intern not found.');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    const alreadyAssociated = await this.prisma.internCourse.findUnique({
      where: {
        internId_courseId: { internId, courseId },
      },
    });

    if (alreadyAssociated) {
      throw new ConflictException('Intern is already assigned to this course.');
    }

    try {
      await this.prisma.$transaction([
        this.prisma.internCourse.create({
          data: {
            internId,
            courseId,
          },
        }),
        this.prisma.grade.create({
          data: {
            internId,
            courseId,
          },
        }),
      ]);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while assigning the intern to the course.',
      );
    }
  }

  async unassignFromCourse(internId: string, courseId: string): Promise<void> {
    const intern = await this.prisma.intern.findUnique({
      where: { id: internId },
    });

    if (!intern) {
      throw new NotFoundException('Intern not found.');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    const internCourse = await this.prisma.internCourse.findUnique({
      where: {
        internId_courseId: { internId, courseId },
      },
    });

    if (!internCourse) {
      throw new ConflictException(
        'Intern is not assigned to the specified course.',
      );
    }

    try {
      await this.prisma.$transaction([
        this.prisma.internAssignment.deleteMany({
          where: {
            internId,
            courseId,
          },
        }),
        this.prisma.grade.delete({
          where: {
            internId_courseId: { internId, courseId },
          },
        }),
        this.prisma.internCourse.delete({
          where: {
            internId_courseId: { internId, courseId },
          },
        }),
      ]);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while unassigning the intern from the course.',
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
      include: {
        internCourses: true,
        internAssignments: true,
      },
    });

    if (!intern) {
      throw new NotFoundException('Intern not found');
    }

    const isInternInCourse = intern.internCourses.some(
      (ic) => ic.courseId === courseId,
    );

    if (!isInternInCourse) {
      throw new ConflictException(
        'Intern is not associated with the specified course.',
      );
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

    const organizationInCourse =
      await this.prisma.organizationCourse.findUnique({
        where: {
          organizationId_courseId: {
            organizationId,
            courseId,
          },
        },
      });

    if (!organizationInCourse) {
      throw new ConflictException(
        'The organization is not associated with the specified course.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.internAssignment.create({
        data: {
          internId,
          organizationId,
          courseId,
        },
      });

      const grade = await tx.grade.findUnique({
        where: {
          internId_courseId: {
            internId,
            courseId,
          },
        },
      });

      if (!grade) {
        throw new InternalServerErrorException(
          'Grade not found for the intern in the specified course.',
        );
      }

      const mentorAssignment = await tx.mentorAssignment.findFirst({
        where: {
          organizationId,
          courseId,
        },
      });

      await tx.grade.update({
        where: {
          internId_courseId: {
            internId,
            courseId,
          },
        },
        data: {
          organizationId,
          mentorId: mentorAssignment?.mentorId,
        },
      });
    });
  }

  async removeOrganizationAssignmentFromCourse(
    courseId: string,
    organizationId: string,
    internId: string,
  ): Promise<void> {
    const existingAssignment = await this.prisma.internAssignment.findUnique({
      where: {
        internId_organizationId_courseId: {
          internId,
          organizationId,
          courseId,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(
        'The intern is not assigned to this organization in the specified course.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.internAssignment.delete({
        where: {
          internId_organizationId_courseId: {
            internId,
            organizationId,
            courseId,
          },
        },
      });

      const grade = await tx.grade.findUnique({
        where: {
          internId_courseId: {
            internId,
            courseId,
          },
        },
      });

      if (!grade) {
        throw new InternalServerErrorException(
          'Grade not found for the intern in the specified course.',
        );
      }

      await tx.grade.update({
        where: {
          internId_courseId: {
            internId,
            courseId,
          },
        },
        data: {
          organizationId: null,
          mentorId: null,
        },
      });
    });
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
