import {
  Grade as GradeModel,
  Attendance,
  Intern,
  Course,
  Mentor,
} from '@prisma/client';

export class Grade {
  constructor(
    public readonly id: string,
    public internId: string,
    public courseId: string,
    public mentorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public s1?: Attendance,
    public s2?: Attendance,
    public s3?: Attendance,
    public s4?: Attendance,
    public s5?: Attendance,
    public s6?: Attendance,
    public initialCommitment?: number,
    public assertiveCommunication?: number,
    public punctuality?: number,
    public classParticipation?: number,
    public proactivity?: number,
    public communicationSkills?: number,
    public punctualityOfDelivery?: number,
    public redaction?: number,
    public performance?: number,
    public recommendation?: string,
  ) {}

  static fromPrisma(
    data: GradeModel & { intern: Intern } & { course: Course } & {
      mentor: Mentor;
    },
  ): Grade {
    return new Grade(
      data.id,
      data.intern.id,
      data.course.id,
      data.mentor.id,
      data.createdAt,
      data.updatedAt,
      data.s1 ?? undefined,
      data.s2 ?? undefined,
      data.s3 ?? undefined,
      data.s4 ?? undefined,
      data.s5 ?? undefined,
      data.s6 ?? undefined,
      data.initialCommitment ?? undefined,
      data.assertiveCommunication ?? undefined,
      data.punctuality ?? undefined,
      data.classParticipation ?? undefined,
      data.proactivity ?? undefined,
      data.communicationSkills ?? undefined,
      data.punctualityOfDelivery ?? undefined,
      data.redaction ?? undefined,
      data.performance ?? undefined,
      data.recommendation ?? undefined,
    );
  }
}
