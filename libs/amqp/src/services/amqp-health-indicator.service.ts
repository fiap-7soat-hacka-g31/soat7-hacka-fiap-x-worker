import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class AmqpHealthIndicatorService extends HealthIndicator {
  constructor(private readonly amqp: AmqpConnection) {
    super();
  }

  async isConnected(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.amqp.connected;
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('AMQP Connection Failed', result);
  }
}
