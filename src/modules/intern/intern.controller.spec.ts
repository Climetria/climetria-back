import { Test, TestingModule } from '@nestjs/testing';
import { InternController } from './intern.controller';

describe('InternController', () => {
  let controller: InternController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternController],
    }).compile();

    controller = module.get<InternController>(InternController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
