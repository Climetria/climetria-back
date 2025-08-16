import { Test, TestingModule } from '@nestjs/testing';
import { OrgCertificateService } from './orgCertificate.service';

describe('OrgCertificateService', () => {
  let service: OrgCertificateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgCertificateService],
    }).compile();

    service = module.get<OrgCertificateService>(OrgCertificateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
