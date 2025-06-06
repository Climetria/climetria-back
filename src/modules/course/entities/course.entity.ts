import { Course as CourseModel } from '@prisma/client';

export class Course {
  constructor(
    public readonly id: string,
    public name: string,
    public year: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public description?: string,
    public deletedAt?: Date,
  ) {}

  static fromPrisma(data: CourseModel): Course {
    return new Course(
      data.id,
      data.name,
      data.year,
      data.createdAt,
      data.updatedAt,
      data.description ?? undefined,
      data.deletedAt ?? undefined,
    );
  }
}
