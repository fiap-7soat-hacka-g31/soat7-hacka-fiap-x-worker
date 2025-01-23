import { AmqpModuleOptions } from '../amqp.factory';
import { toDottedNotation } from './amqp-infrastructure.util';

export const formatExchanges = (exchanges: AmqpModuleOptions['exchanges']) => {
  return exchanges.map(({ name, ...x }) => ({
    ...x,
    name: toDottedNotation(name),
    createExchangeIfNotExists: true,
  }));
};
