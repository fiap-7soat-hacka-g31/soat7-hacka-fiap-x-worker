import { Injectable, Logger } from '@nestjs/common';
import {
  AggregateEvent,
  AggregatePersistanceContext,
} from '../../core/domain/aggregate-root';
import { EventRepository } from '../../core/domain/repository';

@Injectable()
export class MongoosePersistanceContext implements AggregatePersistanceContext {
  private readonly logger = new Logger(MongoosePersistanceContext.name);

  constructor(private readonly eventStorage: EventRepository) {}

  async commit(...events: AggregateEvent[]): Promise<void> {
    await Promise.all(events.map((x) => this.eventStorage.create(x)));
    this.logger.debug(
      `${events.length} events were saved to the event storage`,
    );
  }
}
