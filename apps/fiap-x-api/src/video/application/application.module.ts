import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfraModule } from '../infra/infra.module';
import { CreateVideoHandler } from './commands/create-video.handler';
import { ProcessSnapshotsResultHandler } from './commands/process-snapshots-result.handler';
import { GetMyVideoHandler } from './query/get-my-video.handler';
import { ListMyVideosHandler } from './query/list-my-videos.handler';

const QueryHandlers = [];
const CommandHandlers = [
  CreateVideoHandler,
  GetMyVideoHandler,
  ListMyVideosHandler,
  ProcessSnapshotsResultHandler,
];

@Module({
  imports: [CqrsModule, InfraModule],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class ApplicationModule {}
