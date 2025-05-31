import { Mentor as MentorModel } from '@prisma/client';

export class Mentor {
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

  static fromPrisma(data: MentorModel): Mentor {
    return new Mentor(
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
