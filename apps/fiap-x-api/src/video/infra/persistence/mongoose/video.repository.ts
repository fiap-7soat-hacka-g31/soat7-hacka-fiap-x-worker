import {
  AggregateMergeContext,
  TransactionManager,
} from '@fiap-x/tactical-design/core';
import { MongooseRepository } from '@fiap-x/tactical-design/mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VideoRepository } from '../../../application/abstractions/video.repository';
import { Video } from '../../../domain/entities/video.aggregate';
import { MongooseVideoSchemaFactory } from './video-schema.factory';
import { MongooseVideoSchema } from './video.schema';

export class MongooseVideoRepository
  extends MongooseRepository<MongooseVideoSchema, Video>
  implements VideoRepository
{
  constructor(
    protected readonly transactionManager: TransactionManager,
    @InjectModel(MongooseVideoSchema.name)
    protected readonly Model: Model<MongooseVideoSchema>,
    protected readonly schemaFactory: MongooseVideoSchemaFactory,
    protected readonly mergeContext: AggregateMergeContext,
  ) {
    super(mergeContext, transactionManager, Model, schemaFactory);
  }

  /* istanbul ignore next */
  async findByOwnerAndFilename(
    ownerId: string,
    filename: string,
  ): Promise<Video> {
    return this.findOne({
      ownerId: new Types.ObjectId(ownerId),
      filename,
    });
  }
}
