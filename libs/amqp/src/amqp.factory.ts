import {
  RabbitMQChannelConfig,
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq';
import { Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './amqp.module-builder';

export type AmqpTrafficInspectionOptions = {
  mode?: 'none' | 'all' | 'inbound' | 'outbound';
  // TODO: Implement this
  // ignoredRoutingKeys: []
};

export type AmqpModuleOptions = {
  url: string;
  appName?: string;
  heartbeatIntervalInSeconds?: number;
  reconnectInSeconds?: number;
  prefix?: string;
  exchanges?: RabbitMQExchangeConfig[];
  queues?: RabbitMQQueueConfig[];
  channels?: (RabbitMQChannelConfig & { name: string })[];
  waitForConnection?: boolean;
  trafficInspection?: AmqpTrafficInspectionOptions;
};

export const InjectAmqpModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN);

export interface AmqpOptionsFactory {
  createAmqpOptions(): AmqpModuleOptions | Promise<AmqpModuleOptions>;
}
