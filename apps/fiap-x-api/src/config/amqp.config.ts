import { AmqpModuleOptions, AmqpOptionsFactory } from '@fiap-x/amqp';
import { toDottedNotation } from '@fiap-x/amqp/utils/amqp-infrastructure.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const prefix = 'FiapXApi';

export const withPrefix = (value: string) =>
  `${toDottedNotation(prefix)}.${toDottedNotation(value)}`;

@Injectable()
export class AmqpConfig implements AmqpOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createAmqpOptions(): AmqpModuleOptions {
    const [appName, url, inspectionMode, ci] = [
      this.config.getOrThrow('APP_NAME'),
      this.config.getOrThrow('AMQP_URL'),
      this.config.get('TRAFFIC_INSPECTION_AMQP', 'all'),
      this.config.get('CI'),
    ];
    return {
      url,
      appName,
      prefix,
      trafficInspection: { mode: inspectionMode },
      waitForConnection: Boolean(ci),
      exchanges: [
        // ::StyleKeep::
        { name: withPrefix('events') },
        { name: 'fiap.x.worker.events' },
      ],
    };
  }
}
