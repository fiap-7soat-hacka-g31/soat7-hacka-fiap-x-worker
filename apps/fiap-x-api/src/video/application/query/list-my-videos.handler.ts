import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { ListMyVideosOutput } from '../dtos/list-my-videos.io';
import { ListMyVideosQuery, ListMyVideosResult } from './list-my-videos.query';

@QueryHandler(ListMyVideosQuery)
export class ListMyVideosHandler
  implements IQueryHandler<ListMyVideosQuery, ListMyVideosResult>
{
  constructor(
    @InjectModel(MongooseVideoSchema.name)
    private readonly queryModel: Model<MongooseVideoSchema>,
  ) {}

  async execute(query: ListMyVideosQuery): Promise<ListMyVideosResult> {
    const { ownerId } = query.data;

    const result = await this.queryModel
      .find({
        ownerId: new Types.ObjectId(ownerId),
      })
      .exec();

    if (!result?.length) {
      return new ListMyVideosResult([]);
    }

    return new ListMyVideosResult(
      result.map((x) => {
        const hexId = x._id.toHexString();
        return new ListMyVideosOutput({
          id: hexId,
          filename: x.filename,
          snapshotIntervalInSeconds: x.snapshotIntervalInSeconds,
          status: x.status,
          videoPath: `/videos/${hexId}?target=video`,
          zipPath: `/videos/${hexId}?target=zip`,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        });
      }),
    );
  }
}
