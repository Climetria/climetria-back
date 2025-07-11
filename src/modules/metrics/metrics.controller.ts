import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('course/:courseId/total-interns')
  getTotalInternsInCourse(@Param('courseId') courseId: string) {
    return this.metricsService.getTotalInternsInCourse(courseId);
  }
}
