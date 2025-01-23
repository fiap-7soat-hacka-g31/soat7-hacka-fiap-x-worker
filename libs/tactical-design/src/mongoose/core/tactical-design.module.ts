import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AggregatePersistanceContext } from '../../core/domain/aggregate-root';
import { EventRepository } from '../../core/domain/repository';
import { MongoosePersistanceContext } from './aggregate-context';
import { AggregateEventsController } from './aggregate-events.controller';
import { MongooseEventRepository } from './event.repository';
import { EventSchema, MongooseEventSchema } from './event.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventSchema.name, schema: MongooseEventSchema },
    ]),
  ],
  controllers: [AggregateEventsController],
  providers: [
    {
      provide: EventRepository,
      useClass: MongooseEventRepository,
    },
    {
      provide: AggregatePersistanceContext,
      useClass: MongoosePersistanceContext,
    },
  ],
  exports: [AggregatePersistanceContext],
})
export class MongooseTacticalDesignModule {}
