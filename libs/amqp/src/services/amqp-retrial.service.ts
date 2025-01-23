import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from 'amqplib';
import { AmqpModuleOptions, InjectAmqpModuleOptions } from '../amqp.factory';
import { BindingOptions } from '../decorators/amqp-binding.decorator';
import { RetrialPolicy } from '../decorators/amqp-retrial-policy.decorator';
import { doubleWithEveryAttemptDelayCalculator } from '../utils/amqp-delay.calculator';
import { withPrefix } from '../utils/amqp-infrastructure.util';
import { AmqpParams } from '../utils/amqp-params.util';
import { FailedIdempotencyCheckException } from '../utils/amqp.internals';
import { formatDLQ } from '../utils/format-dlq.util';
import { getCurrentAttempt } from '../utils/get-current-attempt.util';

type ApplyPolicyInput = {
  consumeMessage: Message;
  data: any;
  retrialPolicy?: RetrialPolicy;
  binding?: BindingOptions;
  error?: any;
};

@Injectable()
export class AmqpRetrialService {
  constructor(
    private readonly amqp: AmqpConnection,
    @InjectAmqpModuleOptions()
    private readonly amqpOptions: AmqpModuleOptions,
  ) {}

  async apply(args: ApplyPolicyInput): Promise<string> {
    const { binding, consumeMessage, retrialPolicy, error } = args;
    const { routingKey, queue } = binding;
    const { content, properties } = consumeMessage;
    const { headers } = properties;
    const dlq = formatDLQ(queue);

    const sendToDLQ = async () =>
      this.amqp.publish(AmqpParams.DefaultExchange, dlq, content, properties);

    if (error instanceof BadRequestException) {
      await sendToDLQ();
      return 'Nack::DeadLetter::BadRequest';
    }
    if (error instanceof FailedIdempotencyCheckException) {
      await sendToDLQ();
      return 'Nack::DeadLetter:Idempotency';
    }
    if (!retrialPolicy) {
      await sendToDLQ();
      return 'Nack::DeadLetter::NoRetryPolicy';
    }

    const {
      calculateDelay = doubleWithEveryAttemptDelayCalculator,
      maxAttempts,
      delay,
      maxDelay,
    } = retrialPolicy;
    const currentAttempt = getCurrentAttempt(consumeMessage);
    if (currentAttempt < maxAttempts) {
      const calculatedDelay =
        calculateDelay({ currentAttempt, delay, maxDelay }) * 1000;
      headers[AmqpParams.AttemptCountHeader] = currentAttempt;
      headers[AmqpParams.RoutingKeyHeader] = routingKey;
      headers[AmqpParams.DelayHeader] = calculatedDelay;
      await this.amqp.publish(
        this.amqpOptions.prefix
          ? withPrefix(this.amqpOptions.prefix, AmqpParams.DelayedExchange)
          : AmqpParams.DelayedExchange,
        queue,
        content,
        properties,
      );
      return 'Nack::Retry::Error';
    }

    await sendToDLQ();
    return 'Nack::DeadLetter::MaximumAttempts';
  }
}
