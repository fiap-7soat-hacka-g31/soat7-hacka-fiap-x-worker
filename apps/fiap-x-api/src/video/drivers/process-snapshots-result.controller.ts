import { AmqpRetrialPolicy, AmqpSubscription } from '@fiap-x/amqp';
import { routingKeyOfEvent } from '@fiap-x/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../config/amqp.config';
import { ProcessSnapshotsResultCommand } from '../application/commands/process-snapshots-result.command';
import { SnapshotsProcessed } from '../application/dtos/snapshots-processed.io';

@Injectable()
export class ProcessSnapshotsResultController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.x.worker.events',
    routingKey: routingKeyOfEvent(SnapshotsProcessed),
    queue: withPrefix(ProcessSnapshotsResultCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 15,
    maxDelay: 5,
    maxAttempts: 5,
  })
  async execute(@Body() event: SnapshotsProcessed) {
    await this.commandBus.execute(new ProcessSnapshotsResultCommand(event));
  }
}
