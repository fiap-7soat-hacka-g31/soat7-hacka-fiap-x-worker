import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EVideoStatus } from '../../domain/values/video-status.value';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { GetMyVideosOutput } from '../dtos/get-my-video.io';
import { GetMyVideoQuery, GetMyVideoResult } from './get-my-video.query';

@QueryHandler(GetMyVideoQuery)
export class GetMyVideoHandler
  implements IQueryHandler<GetMyVideoQuery, GetMyVideoResult>
{
  constructor(
    @InjectModel(MongooseVideoSchema.name)
    private readonly queryModel: Model<MongooseVideoSchema>,
  ) {}

  async execute(query: GetMyVideoQuery): Promise<GetMyVideoResult> {
    const { id, ownerId } = query.data;

    const result = await this.queryModel
      .findOne({
        _id: new Types.ObjectId(id),
        ownerId: new Types.ObjectId(ownerId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException();
    }

    const hexId = result._id.toHexString();
    return new GetMyVideoResult(
      new GetMyVideosOutput({
        id: hexId,
        filename: result.filename,
        snapshotIntervalInSeconds: result.snapshotIntervalInSeconds,
        status: result.status,
        videoPath: `/videos/${hexId}?target=video`,
        zipPath:
          result.status === EVideoStatus.Processed
            ? `/videos/${hexId}?target=zip`
            : null,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }),
    );
  }
}
