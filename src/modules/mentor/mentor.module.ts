import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [MentorService, AuthService],
  controllers: [MentorController],
})
export class MentorModule {}
