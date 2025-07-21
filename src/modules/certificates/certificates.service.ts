import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CertificateInternshipResponseDto } from './dto/certificateInternship-response.dto';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getInternshipCertificate(
    id: string,
  ): Promise<CertificateInternshipResponseDto> {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        intern: true,
        course: true,
        organization: true,
      },
    });

    if (!grade) {
      throw new NotFoundException(
        `Internship certificate with id '${id}' was not found.`,
      );
    }

    const fullName =
      `${grade.intern.firstNames} ${grade.intern.lastNameFather} ${grade.intern.lastNameMother}`.trim();

    return {
      fullName,
      course: grade.course.name,
      organization: grade.organization?.organizationName || 'Not assigned',
    };
  }
}
