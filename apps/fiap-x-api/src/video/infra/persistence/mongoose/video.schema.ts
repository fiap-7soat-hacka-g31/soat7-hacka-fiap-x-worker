import { MongooseEntitySchema } from '@fiap-x/tactical-design/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { VideoStatusValues } from '../../../domain/values/video-status.value';

@Schema({ _id: false })
export class MongooseCloudFileSchema {
  @Prop()
  provider: string;

  @Prop()
  bucket: string;

  @Prop()
  path: string;
}

@Schema({ collection: 'Videos', timestamps: true })
export class MongooseVideoSchema extends MongooseEntitySchema {
  @Prop()
  filename: string;

  @Prop()
  ownerId: Types.ObjectId;

  @Prop({ type: String })
  status: VideoStatusValues;

  @Prop()
  snapshotIntervalInSeconds: number;

  @Prop({ type: MongooseCloudFileSchema })
  videoFile: MongooseCloudFileSchema;

  @Prop({ type: MongooseCloudFileSchema })
  zipFile: MongooseCloudFileSchema;
}

export const MongooseVideoSchemaModel =
  SchemaFactory.createForClass(MongooseVideoSchema);

MongooseVideoSchemaModel.index({ ownerId: 1, filename: 1 }, { unique: true });
