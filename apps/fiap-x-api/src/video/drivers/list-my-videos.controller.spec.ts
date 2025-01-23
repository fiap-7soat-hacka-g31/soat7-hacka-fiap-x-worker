import { User } from '@fiap-x/setup/auth';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ListMyVideosQuery } from '../application/query/list-my-videos.query';
import { ListMyVideosController } from './list-my-videos.controller';

describe('ListMyVideosController', () => {
  let target: ListMyVideosController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HttpModule, ConfigModule],
      controllers: [ListMyVideosController],
    }).compile();

    target = app.get(ListMyVideosController);
    queryBus = app.get(QueryBus);
  });

  const user = new User({
    id: new Types.ObjectId().toHexString(),
    name: 'Jack Sparrow',
    email: 'jack@sparrow.com',
  });

  it('should execute ListMyVideosQuery', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue({ data: [] });
    const result = await target.execute(user);
    expect(queryBus.execute).toHaveBeenCalledWith(
      new ListMyVideosQuery({ ownerId: expect.any(String) }),
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it('should throw if QueryBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);
    await expect(() => target.execute(user)).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(
      new ListMyVideosQuery({ ownerId: expect.any(String) }),
    );
  });
});
