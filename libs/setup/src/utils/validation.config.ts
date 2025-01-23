import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';

export const configureValidation = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);

  app.useGlobalPipes(
    new ValidationPipe(
      options.validationPipe ?? {
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      },
    ),
  );
  Logger.log('Validation initialized', 'StartupUtils');
  return app;
};
