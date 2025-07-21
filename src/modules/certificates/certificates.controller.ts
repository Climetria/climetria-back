import { Controller, Get, Param } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificateInternshipResponseDto } from './dto/certificateInternship-response.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('internships/:id')
  async getInternshipCertificate(
    @Param('id') id: string,
  ): Promise<CertificateInternshipResponseDto> {
    return this.certificatesService.getInternshipCertificate(id);
  }
}
