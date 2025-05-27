import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { InternModule } from './modules/intern/intern.module';
import { MentorModule } from './modules/mentor/mentor.module';

@Module({
  imports: [PrismaModule, CompanyModule, InternModule, MentorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
