import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgCertificateDto } from './create-orgCertificate.dto';

export class UpdateOrgCertificateDto extends PartialType(
  CreateOrgCertificateDto,
) {}
