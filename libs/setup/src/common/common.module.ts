import { Global, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './common.builder';

@Global()
@Module({
  exports: [MODULE_OPTIONS_TOKEN],
})
export class CommonModule extends ConfigurableModuleClass {}
