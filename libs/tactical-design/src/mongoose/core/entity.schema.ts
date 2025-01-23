import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class MongooseEntitySchema {
  @Prop()
  readonly _id: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
