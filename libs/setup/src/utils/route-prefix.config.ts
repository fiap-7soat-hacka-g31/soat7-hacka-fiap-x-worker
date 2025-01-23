import { INestApplication, Logger } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';

export const configureRoutePrefix = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  const prefix = (options.routePrefix ?? '').trim();

  if (prefix) {
    app.setGlobalPrefix(prefix);
    Logger.log('Route Prefixes Initialized', 'StartupUtils');
  }
  return app;
};
