import { AggregateEvent } from './aggregate-root';
import { Entity } from './entity';

export interface Repository<TEntity extends Entity> {
  create(entity: TEntity): Promise<void>;
  update(entity: TEntity): Promise<void>;
  findById(id: string): Promise<TEntity>;
  findAll(): Promise<TEntity[]>;
  newId(): string;
}

export abstract class EventRepository<
  TEvent extends AggregateEvent = AggregateEvent,
> {
  abstract create(event: TEvent): Promise<void>;
  abstract findById(id: string): Promise<TEvent>;
  abstract findByAggregateId(aggregateId: string): Promise<TEvent[]>;
}
