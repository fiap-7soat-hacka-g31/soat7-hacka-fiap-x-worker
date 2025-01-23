import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ContextModuleOptions } from './context.options';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ContextModuleOptions>()
    .setClassMethodName('forRoot')
    .setFactoryMethodName('setupWith')
    .build();
