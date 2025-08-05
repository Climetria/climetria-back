import { Controller, Get, Param } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificateInternshipResponseDto } from './dto/certificate-response.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('internships/:id')
  async getInternshipCertificate(
    @Param('id') id: string,
  ): Promise<CertificateInternshipResponseDto> {
    return this.certificatesService.getInternshipCertificate(id);
  }

  /*
  @Get('courses/:id')
  async getCourseCertificate(
    @Param('id') id: string,
  ): Promise<CertificateCourseResponseDto> {
    return this.certificatesService.getInternshipCertificate(id);
  }
  */
}
