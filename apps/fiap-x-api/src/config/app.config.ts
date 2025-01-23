import { CommonModuleOptions, CommonOptionsFactory } from '@fiap-x/setup';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig implements CommonOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createOptions(): CommonModuleOptions {
    const appName = this.config.getOrThrow('APP_NAME');
    const appDescription = this.config.getOrThrow('APP_DESCRIPTION');
    const appVersion = this.config.getOrThrow('APP_VERSION');
    const environment = this.config.get('NODE_ENV', 'development');
    const routePrefix = this.config.get('ROUTE_PREFIX', '');
    const logFormat = this.config.get('LOG_FORMAT', 'json');
    const logLevel = this.config.get('LOG_LEVEL', 'info');
    const logSilent = this.config.get('LOG_SILENT', 'false');
    const httpTrafficInspectionMode = this.config.get(
      'TRAFFIC_INSPECTION_HTTP',
      'all',
    );

    return {
      appName,
      appDescription,
      appVersion,
      environment,
      routePrefix,
      httpTrafficInspection: {
        mode: httpTrafficInspectionMode,
        ignoredInboundRoutes: ['*healthz*'],
        enabledOutboundHosts: ['*.requestinspector.com'],
      },
      logger: {
        format: logFormat,
        level: logLevel,
        silent: logSilent === 'true',
      },
      openApiServers: [
        // ::KeepStyle::
        // { url: 'https://app.fiapburger.dev', description: 'production' },
        // { url: 'https://stg-app.fiapburger.dev', description: 'staging' },
        // { url: 'https://dev-app.fiapburger.dev', description: 'development' },
        { url: 'http://localhost:3000', description: 'development' },
      ],
    };
  }
}
