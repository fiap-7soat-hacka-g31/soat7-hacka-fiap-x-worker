import { User } from '@fiap-x/setup/auth';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { CreateVideoCommand } from '../application/commands/create-video.command';
import { CreateVideoController } from './create-my-video.controller';

describe('CreateVideoController', () => {
  let target: CreateVideoController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HttpModule, ConfigModule],
      controllers: [CreateVideoController],
    }).compile();

    target = app.get(CreateVideoController);
    commandBus = app.get(CommandBus);
  });

  const user = new User({
    id: new Types.ObjectId().toHexString(),
    name: 'Jack Sparrow',
    email: 'jack@sparrow.com',
  });

  it('should execute UploadVideoCommand', async () => {
    const id = randomUUID();
    jest.spyOn(commandBus, 'execute').mockResolvedValue({ data: { id } });
    const filename = 'video.mp4';
    const result = await target.execute(
      { snapshotIntervalInSeconds: 5, filename, ownerId: null },
      user,
    );
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateVideoCommand({
        filename,
        snapshotIntervalInSeconds: expect.any(Number),
        ownerId: expect.any(String),
      }),
    );
    expect(result.id).toBe(id);
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    const filename = 'video.mp4';
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    await expect(() =>
      target.execute(
        { snapshotIntervalInSeconds: 5, filename, ownerId: null },
        user,
      ),
    ).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateVideoCommand({
        filename,
        ownerId: expect.any(String),
        snapshotIntervalInSeconds: expect.any(Number),
      }),
    );
  });
});
