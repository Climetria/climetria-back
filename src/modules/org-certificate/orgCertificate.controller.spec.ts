import { Test, TestingModule } from '@nestjs/testing';
import { OrgCertificateController } from './orgCertificate.controller';

describe('OrgCertificateController', () => {
  let controller: OrgCertificateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgCertificateController],
    }).compile();

    controller = module.get<OrgCertificateController>(OrgCertificateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
