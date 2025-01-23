import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { InternalServerErrorException } from '@nestjs/common';
import { AmqpModuleOptions } from '../amqp.factory';
import {
  AMQP_INTERNAL_DEFAULT_CHANNEL,
  getDelayedRetrialExchange,
  getRerouterQueueName,
} from './amqp-infrastructure.util';
import { formatChannels } from './format-channels.util';
import { formatExchanges } from './format-exchnges.util';
import { mergeChannels } from './merge-channels.util';
import { mergeQueues } from './merge-queues.util';

export const QueuesFromDecoratorsContainer = new Set<string>();
export const ChannelsFromDecoratorsContainer: AmqpModuleOptions['channels'] =
  [];

/**
 * This internal exception signals that we were unable to
 * communicate with RabbitMQ Server for requeueing or nacking.
 * This is a catastrophical event.
 */
export class FailedPolicyException extends Error {
  readonly innerException: { stack: string; message: string };
  constructor(innerException: any) {
    super(`Failed Policy Exception`);
    this.innerException = {
      message: innerException.message,
      stack: innerException.stack,
    };
  }
}

export class FailedIdempotencyCheckException extends InternalServerErrorException {
  constructor() {
    super(`Failed Idempotency Check Exception`);
  }
}

export const InternalRabbitMQConfigFactory = (
  options: AmqpModuleOptions,
): RabbitMQConfig => {
  const { exchanges = [], waitForConnection = false } = options;
  const exchangePrefix = options.prefix ?? '';
  const queues = mergeQueues(options, QueuesFromDecoratorsContainer);
  exchanges.push(getDelayedRetrialExchange(exchangePrefix));
  queues.push(getRerouterQueueName(exchangePrefix));
  const channels = mergeChannels(options, ChannelsFromDecoratorsContainer);
  if (!channels.find((x) => x.default)) {
    channels.push(AMQP_INTERNAL_DEFAULT_CHANNEL);
  }
  // TODO: change for class setup simplifying this file
  return {
    uri: options.url,
    exchanges: formatExchanges(exchanges),
    queues,
    connectionInitOptions: { wait: waitForConnection },
    channels: formatChannels(channels),
    connectionManagerOptions: {
      connectionOptions: {
        clientProperties: {
          connection_name: options.appName,
        },
      },
      reconnectTimeInSeconds: options.reconnectInSeconds ?? 10,
      heartbeatIntervalInSeconds: options.heartbeatIntervalInSeconds ?? 60,
    },
  };
};
