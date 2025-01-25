import {
  AmqpCurrentAttempt,
  AmqpRetrialPolicy,
  AmqpSubscription,
} from '@fiap-x/amqp';
import { routingKeyOfEvent } from '@fiap-x/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../config/amqp.config';
import { CreateSnapshotsCommand } from '../application/commands/create-snapshots.command';
import { VideoUploaded } from '../application/dtos/create-snapshots.io';

@Injectable()
export class CreateSnapshotsController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.x.api.events',
    routingKey: routingKeyOfEvent(VideoUploaded),
    queue: withPrefix(CreateSnapshotsCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 60,
    maxDelay: 60,
    maxAttempts: 5,
  })
  async execute(
    @Body() event: VideoUploaded,
    @AmqpCurrentAttempt() attemptCount: number,
  ) {
    const command = new CreateSnapshotsCommand(event);
    command.currentAttempt = attemptCount;
    await this.commandBus.execute(command);
  }
}
