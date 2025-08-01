import {
  CreateOrganizationDto,
  CreateOrganizationFilterDto,
  UploadOrganizationCertificateInfoDto,
} from './create-organization.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class UpdateOrganizationFilterDto extends PartialType(
  CreateOrganizationFilterDto,
) {}

export class UpdateOrganizationCertificateInfoDto extends PartialType(
  UploadOrganizationCertificateInfoDto,
) {}
