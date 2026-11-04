import { Module } from '@nestjs/common';
import { OrgCertificateService } from './orgCertificate.service';
import { OrgCertificateController } from './orgCertificate.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [OrgCertificateService],
  controllers: [OrgCertificateController],
})
export class OrgCertificateModule {}
