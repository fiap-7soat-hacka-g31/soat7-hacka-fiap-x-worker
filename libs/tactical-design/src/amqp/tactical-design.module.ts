import { Global, Module } from '@nestjs/common';
import { AggregatePublisherContext } from '../core';
import { AmqpPublisherContext } from './amqp-publisher-context';

@Global()
@Module({
  providers: [
    {
      provide: AggregatePublisherContext,
      useClass: AmqpPublisherContext,
    },
  ],
  exports: [AggregatePublisherContext],
})
export class AmqpTacticalDesignModule {}
