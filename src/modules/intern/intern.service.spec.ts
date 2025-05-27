import { Test, TestingModule } from '@nestjs/testing';
import { InternService } from './intern.service';

describe('InternService', () => {
  let service: InternService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InternService],
    }).compile();

    service = module.get<InternService>(InternService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
