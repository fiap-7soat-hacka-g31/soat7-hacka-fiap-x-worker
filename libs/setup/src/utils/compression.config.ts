import { INestApplication, Logger } from '@nestjs/common';
import * as compression from 'compression';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';

export const configureCompression = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  app.use(compression(options.compression));
  Logger.log('Compression initialized', 'StartupUtils');
  return app;
};
