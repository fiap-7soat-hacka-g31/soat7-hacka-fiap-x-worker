import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './amqp.module-builder';
import { AmqpHealthIndicatorService } from './services/amqp-health-indicator.service';
import { AmqpInspectionService } from './services/amqp-inspection.service';
import { AmqpRetrialService } from './services/amqp-retrial.service';
import { AmqpThrottleService } from './services/amqp-throttle.service';
import { AmqpService } from './services/amqp.service';
import { InternalRabbitMQConfigFactory } from './utils/amqp.internals';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: InternalRabbitMQConfigFactory,
    }),
  ],
  providers: [
    AmqpService,
    AmqpThrottleService,
    AmqpInspectionService,
    AmqpRetrialService,
    AmqpHealthIndicatorService,
  ],
  exports: [
    MODULE_OPTIONS_TOKEN,
    AmqpService,
    AmqpThrottleService,
    AmqpInspectionService,
    AmqpRetrialService,
    AmqpHealthIndicatorService,
  ],
})
export class AmqpModule extends ConfigurableModuleClass {}
