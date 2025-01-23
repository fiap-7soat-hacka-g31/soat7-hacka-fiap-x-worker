import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VideoSuite } from './step-definitions/video.suite';
@Module({
  imports: [HttpModule],
  providers: [VideoSuite],
})
export class AppModule {}
