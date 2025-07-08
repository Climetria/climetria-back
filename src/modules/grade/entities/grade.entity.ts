import {
  Grade as GradeModel,
  Attendance,
  Intern,
  Course,
  Mentor,
  Organization,
} from '@prisma/client';

export class Grade {
  constructor(
    public readonly id: string,
    public internId: string,
    public courseId: string,
    public finalReportCheck: boolean,
    public talkCheck: boolean,
    public recommendationCheck: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public mentorId?: string,
    public organizationId?: string,
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

  get totalNote(): number {
    return (
      (this.punctuality ?? 0) +
      (this.classParticipation ?? 0) +
      (this.proactivity ?? 0) +
      (this.communicationSkills ?? 0) +
      (this.punctualityOfDelivery ?? 0) +
      (this.redaction ?? 0)
    );
  }

  get internshipCertificate(): boolean {
    return this.finalReportCheck && this.talkCheck;
  }

  get courseCertificate(): boolean {
    const sValues = [this.s1, this.s2, this.s3, this.s4, this.s5, this.s6];
    const countA = sValues.filter((s) => s === 'A').length;

    const hasMinimumScores =
      (this.punctuality ?? 0) >= 1 &&
      (this.classParticipation ?? 0) >= 1 &&
      (this.proactivity ?? 0) >= 1 &&
      (this.communicationSkills ?? 0) >= 1 &&
      (this.punctualityOfDelivery ?? 0) >= 1 &&
      (this.redaction ?? 0) >= 1;

    return countA >= 4 && hasMinimumScores;
  }

  static fromPrisma(
    data: GradeModel & {
      intern: Intern;
      course: Course;
      mentor?: Mentor | null;
      organization?: Organization | null;
    },
  ): Grade {
    return new Grade(
      data.id,
      data.intern.id,
      data.course.id,
      data.finalReportCheck,
      data.talkCheck,
      data.recommendationCheck,
      data.createdAt,
      data.updatedAt,
      data.mentor?.id,
      data.organization?.id,
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
