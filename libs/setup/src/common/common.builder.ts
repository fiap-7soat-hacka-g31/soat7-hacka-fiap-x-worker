import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CommonModuleOptions } from './common.options';

export const { MODULE_OPTIONS_TOKEN, ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<CommonModuleOptions>()
    .setClassMethodName('forRoot')
    .setFactoryMethodName('createOptions')
    .build();
