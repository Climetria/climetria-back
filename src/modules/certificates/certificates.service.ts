import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CertificateInternshipResponseDto } from './dto/certificate-response.dto';

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

    const organizationName =
      grade.organization?.organizationName || 'Not assigned';
    const logoUrl = grade.organization?.logoUrl || '';
    const signerFullName = grade.organization?.signerFullName || '';
    const signerTitle = grade.organization?.signerTitle || '';
    const signerSignatureUrl = grade.organization?.signerSignatureUrl || '';

    return {
      fullName,
      course: grade.course.name,
      organization: organizationName,
      logoUrl,
      signerFullName,
      signerTitle,
      signerSignatureUrl,
    };
  }
}
