import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfraModule } from '../infra/infra.module';
import { CreateSnapshotsHandler } from './commands/create-snapshots.handler';

const CommandHandlers = [CreateSnapshotsHandler];
const QueryHandlers = [];

@Module({
  imports: [CqrsModule, InfraModule],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class ApplicationModule {}
