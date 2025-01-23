import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model, Types } from 'mongoose';
import { AggregateEvent, DomainEvent } from '../../core/domain/aggregate-root';
import { EventRepository } from '../../core/domain/repository';
import { TransactionManager } from '../../core/transactional/transaction.manager';
import { EventSchema } from './event.schema';

@Injectable()
export class MongooseEventRepository<
  TEvent extends AggregateEvent = AggregateEvent,
  TSchema extends EventSchema = EventSchema,
> implements EventRepository<TEvent>
{
  constructor(
    protected readonly transactionManager: TransactionManager,
    @InjectModel(EventSchema.name)
    protected readonly eventModel: Model<EventSchema>,
  ) {}

  async findById(id: string): Promise<TEvent> {
    return this.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async findByAggregateId(aggregateId: string): Promise<TEvent[]> {
    return this.find({ aggregateId: new Types.ObjectId(aggregateId) });
  }

  async create(event: TEvent): Promise<void> {
    const session = this.getSession();
    (event as any).id = new Types.ObjectId().toHexString();
    const schema = this.toSchema(event);
    await new this.eventModel(schema).save({ session });
  }

  protected async find(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEvent[]> {
    const foundValues = await this.eventModel
      .find(entityFilterQuery, {}, { lean: true, sort: { timestamp: 1 } })
      .exec();
    return foundValues.map((entityDocument) =>
      this.toEvent(entityDocument as TSchema),
    );
  }

  protected async findOne(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEvent> {
    const entityDocument = await this.eventModel
      .findOne(entityFilterQuery, {}, { lean: true })
      .exec();

    if (!entityDocument) {
      return;
    }

    return this.toEvent(entityDocument as TSchema);
  }

  protected getSession(): ClientSession | undefined {
    return this.transactionManager.getRunningTransactionOrDefault()
      ?.hostTransaction;
  }

  private toSchema(aggregateEvent: TEvent): EventSchema<TEvent> {
    return {
      _id: new Types.ObjectId(aggregateEvent.id),
      aggregateId: new Types.ObjectId(aggregateEvent.aggregateId),
      eventName: aggregateEvent.eventName,
      timestamp: aggregateEvent.timestamp,
      version: aggregateEvent.version,
      event: aggregateEvent.data,
    };
  }

  private toEvent(schema: EventSchema<AggregateEvent<DomainEvent>>): TEvent {
    const EventConstructor = function (data) {
      Object.assign(this, data);
    };
    Object.defineProperty(EventConstructor, 'name', {
      value: schema.eventName,
    });
    const domainEvent = new EventConstructor(schema.event);
    return new AggregateEvent(
      schema._id.toHexString(),
      schema.aggregateId.toHexString(),
      schema.eventName,
      schema.timestamp,
      schema.version,
      domainEvent,
    ) as TEvent;
  }
}
