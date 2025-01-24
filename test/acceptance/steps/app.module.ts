import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SampleSuite } from './step-definitions/sample.suite';
@Module({
  imports: [HttpModule],
  providers: [SampleSuite],
})
export class AppModule {}
