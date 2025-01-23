import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';

export const configureOpenAPI = async (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  const version = `v${options.appVersion ?? '1.0.0'}-${options.environment ?? 'development'}`;
  const route = options.openAPIRoute ?? 'docs';
  const configBuilder = new DocumentBuilder()
    .setTitle(options.appName ?? 'App')
    .setDescription(options.appDescription ?? 'A Nestjs Application')
    .setVersion(version)
    .setExternalDoc('Export Specs', `/${route}-json`);

  const serversFromConfig = options.openApiServers ?? [];
  for (const server of serversFromConfig) {
    const { url, description } = server;
    configBuilder.addServer(url, description);
  }

  const document = SwaggerModule.createDocument(app, configBuilder.build());
  SwaggerModule.setup(options.openAPIRoute ?? 'docs', app, document);
  return app;
};
