import { Module } from '@nestjs/common';
import { OrgCertificateService } from './orgCertificate.service';
import { OrgCertificateController } from './orgCertificate.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [OrgCertificateService],
  controllers: [OrgCertificateController],
})
export class OrgCertificateModule {}
