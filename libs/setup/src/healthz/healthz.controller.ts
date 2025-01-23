import { AmqpHealthIndicatorService } from '@fiap-x/amqp';
import { Controller, Get } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health Check')
@Controller('healthz')
export class HealthzController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongodb: MongooseHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly moduleRef: ModuleRef,
  ) {}

  private tryGetAMQP(): AmqpHealthIndicatorService {
    try {
      return this.moduleRef.get(AmqpHealthIndicatorService, { strict: false });
    } catch {
      return null;
    }
  }

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Executes Health Check',
    description:
      'Runs a health check on the service and its dependencies, including upstream services',
  })
  async checkHealth() {
    const amqp = this.tryGetAMQP();

    return this.health.check([
      () => this.mongodb.pingCheck('Database'),
      () => amqp?.isConnected('MessageBroker'),
    ]);
  }

  @Get('self')
  @HealthCheck()
  @ApiOperation({
    summary: 'Executes Self Health Check',
    description:
      'Runs a health check on the service and its core dependencies, exclusing upstream services',
  })
  async checkSelfHealth() {
    const amqp = this.tryGetAMQP();

    return this.health.check([
      () => this.mongodb.pingCheck('Database'),
      () => amqp?.isConnected('MessageBroker'),
    ]);
  }
}
