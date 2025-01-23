import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { AggregateEvent } from '../../core/domain/aggregate-root';

@Schema({ collection: 'Events' })
export class EventSchema<T extends AggregateEvent = AggregateEvent> {
  @Prop()
  readonly _id: Types.ObjectId;

  @Prop()
  readonly eventName: string;

  @Prop({ type: Types.ObjectId })
  readonly aggregateId: Types.ObjectId;

  @Prop()
  readonly timestamp: Date;

  @Prop()
  readonly version: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  readonly event: T['data'];
}

export const MongooseEventSchema = SchemaFactory.createForClass(EventSchema);

MongooseEventSchema.index({ aggregateId: 1, version: 1 });
MongooseEventSchema.index({ aggregateId: 1, eventName: 1 });
MongooseEventSchema.index({ aggregateId: 1, timestamp: 1 });
