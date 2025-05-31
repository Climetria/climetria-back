import { Module } from '@nestjs/common';
import { InternService } from './intern.service';
import { InternController } from './intern.controller';

@Module({
  providers: [InternService],
  controllers: [InternController],
})
export class InternModule {}
