import {
  ConfigurableModuleBuilder,
  Global,
  Module,
  Type,
} from '@nestjs/common';
import { TransactionManager } from './transaction.manager';

export type TransactionalModuleOptions = object;
export type TransactionalModuleExtraOptions = {
  TransactionManagerAdapter: Type<TransactionManager>;
};

const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<TransactionalModuleOptions>()
    .setClassMethodName('forFeature')
    .setFactoryMethodName('createTransactionalOptions')
    .setExtras(null, (definitions, extras: TransactionalModuleExtraOptions) => {
      const { TransactionManagerAdapter } = extras;
      return {
        global: true,
        ...definitions,
        providers: [
          ...(definitions.providers || []),
          {
            provide: TransactionManager,
            useClass: TransactionManagerAdapter,
          },
        ],
        exports: [...(definitions.exports || []), TransactionManager],
      };
    })
    .build();

@Global()
@Module({})
export class TransactionalModule extends ConfigurableModuleClass {}
