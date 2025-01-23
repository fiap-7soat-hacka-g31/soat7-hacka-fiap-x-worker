import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';

export const configureVersioning = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);

  app.enableVersioning(options.versioning ?? { type: VersioningType.URI });
  Logger.log('API Versioning initialized', 'StartupUtils');
  return app;
};
