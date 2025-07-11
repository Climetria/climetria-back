import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { InternModule } from './modules/intern/intern.module';
import { MentorModule } from './modules/mentor/mentor.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './modules/course/course.module';
import { GradeModule } from './modules/grade/grade.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OrganizationModule,
    InternModule,
    MentorModule,
    AuthModule,
    CourseModule,
    GradeModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
