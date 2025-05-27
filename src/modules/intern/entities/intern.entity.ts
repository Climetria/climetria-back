import { Intern as InternModel } from '@prisma/client';

export class Intern {
  constructor(
    public readonly id: string,
    public name: string,
    public lastName: string,
    public document: string,
    public gender: string,
    public birthdate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(data: InternModel): Intern {
    return new Intern(
      data.id,
      data.name,
      data.lastName,
      data.document,
      data.gender,
      data.birthdate,
      data.createdAt,
      data.updatedAt,
    );
  }
}
