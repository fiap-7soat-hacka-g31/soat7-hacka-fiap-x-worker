import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../application/application.module';
import { CreateVideoController } from './create-my-video.controller';
import { GetMyVideoController } from './get-my-video.controller';
import { ListMyVideosController } from './list-my-videos.controller';
import { ProcessSnapshotsResultController } from './process-snapshots-result.controller';

const HttpDrivers = [
  CreateVideoController,
  GetMyVideoController,
  ListMyVideosController,
];

const AmqpDrivers = [ProcessSnapshotsResultController];

@Module({
  imports: [CqrsModule, ApplicationModule],
  providers: [...AmqpDrivers],
  controllers: [...HttpDrivers],
})
export class DriversModule {}
