import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../application/application.module';
import { CreateSnapshotsController } from './process-snapshots-result.controller';

const HttpDrivers = [];

const AmqpDrivers = [CreateSnapshotsController];

@Module({
  imports: [CqrsModule, ApplicationModule],
  providers: [...AmqpDrivers],
  controllers: [...HttpDrivers],
})
export class DriversModule {}
