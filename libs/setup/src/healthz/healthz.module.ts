import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthzController } from './healthz.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthzController],
})
export class HealthzModule {}
