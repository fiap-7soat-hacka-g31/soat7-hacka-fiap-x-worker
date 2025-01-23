import { ContextModuleOptions } from './context.options';

export interface ContextifyOptionsFactory {
  setupWith(): ContextModuleOptions | Promise<ContextModuleOptions>;
}
