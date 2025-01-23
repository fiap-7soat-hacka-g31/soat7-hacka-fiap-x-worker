import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsObject, IsString } from 'class-validator';
import { Entity } from './entity';

export abstract class DomainEvent /* NOSONAR */ {}

export class AggregateEvent<T extends DomainEvent = DomainEvent> {
  @ApiProperty()
  @IsString()
  public readonly id: string;

  @ApiProperty()
  @IsString()
  public readonly aggregateId: string;

  @ApiProperty()
  @IsString()
  public readonly eventName: string;

  @ApiProperty()
  @IsDateString()
  public readonly timestamp: Date;

  @ApiProperty()
  @IsNumber()
  public readonly version: number;

  @ApiProperty({ description: 'The internal domain event structure' })
  @IsObject()
  public readonly data: T;

  constructor(
    id: string,
    aggregateId: string,
    eventName: string,
    timestamp: Date,
    version: number,
    data: T,
  ) {
    this.id = id;
    this.aggregateId = aggregateId;
    this.eventName = eventName;
    this.timestamp = timestamp;
    this.version = version;
    this.data = data;
  }
}

export abstract class IntegrationEvent<T> extends AggregateEvent<T> {}

export interface AggregateContext {
  /**
   * Propagates the aggregate events to the configured contexts
   */
  commit(...events: AggregateEvent[]): Promise<void>;
}

export abstract class AggregatePersistanceContext implements AggregateContext {
  abstract commit(...events: AggregateEvent[]): Promise<void>;
}

export abstract class AggregatePublisherContext implements AggregateContext {
  abstract commit(...events: AggregateEvent[]): Promise<void>;
}

@Injectable()
export class AggregateMergeContext {
  constructor(
    private readonly persistance: AggregatePersistanceContext,
    private readonly publisher: AggregatePublisherContext,
  ) {}

  mergeObjectContext<T extends AggregateRoot>(object: T) {
    object['$registerContext'](this.persistance);
    object['$registerContext'](this.publisher);
    return object;
  }
}

export abstract class AggregateRoot extends Entity {
  private _version: number;
  private readonly _contexts: Record<string, AggregateContext> = {};
  private readonly _events: AggregateEvent[] = [];

  private $registerContext(context: AggregateContext) {
    this._contexts[context.constructor.name] = context;
  }

  get version() {
    return this._version;
  }

  get events() {
    return this._events;
  }

  async commit(): Promise<void> {
    await this.commitAll(this._events);
    this.resetEvents();
  }

  protected async commitAll(events: AggregateEvent[]): Promise<void> {
    for (const context of Object.values(this._contexts)) {
      await context.commit(...events);
    }
  }

  private resetEvents() {
    this._events.length = 0;
  }

  protected apply(...events: DomainEvent[]) {
    for (const event of events) {
      this.applyEvent(event);
      const aggregateEvent = new AggregateEvent(
        'draft',
        this._id,
        event.constructor.name,
        new Date(),
        this._version,
        event,
      );
      this._events.push(aggregateEvent);
    }
  }

  private applyEvent(event: DomainEvent) {
    const handler = `on${event.constructor.name}`;
    this[handler](event);
    this._version = (this._version ?? 0) + 1;
  }
}
