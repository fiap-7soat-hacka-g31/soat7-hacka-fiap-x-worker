import { Transactional } from '@fiap-x/tactical-design/core';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VideoRepository } from '../abstractions/video.repository';
import { ProcessSnapshotsResultCommand } from './process-snapshots-result.command';

@CommandHandler(ProcessSnapshotsResultCommand)
export class ProcessSnapshotsResultHandler
  implements ICommandHandler<ProcessSnapshotsResultCommand, void>
{
  constructor(private readonly repository: VideoRepository) {}

  @Transactional()
  async execute(command: ProcessSnapshotsResultCommand): Promise<void> {
    const { id, status, provider, bucket, path, failReason } =
      command.event.data;
    const aggregate = await this.repository.findById(id);
    if (!aggregate) {
      throw new NotFoundException();
    }
    if (status === 'SUCCESS') {
      aggregate.appendZip(provider, bucket, path);
    }
    if (status === 'FAILED') {
      aggregate.reject(failReason);
    }

    await this.repository.update(aggregate);
    await aggregate.commit();
  }
}
