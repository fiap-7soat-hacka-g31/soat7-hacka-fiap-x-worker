import {
  Inject,
  ValidationPipeOptions,
  VersioningOptions,
} from '@nestjs/common';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import * as compression from 'compression';
import { HelmetOptions } from 'helmet';
import { Obfuscator } from '../logger/obfuscator';
import { MODULE_OPTIONS_TOKEN } from './common.builder';

export type ObfuscationOptions = {
  obfuscator?: Obfuscator;
  sensitiveKeys?: (string | RegExp)[];
};

export type LoggerOptions = {
  silent?: boolean;
  level?: 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  format?: 'json' | 'pretty';
  obfuscation?: ObfuscationOptions;
};

export type HttpTrafficInspectionOptions = {
  mode?: 'none' | 'all' | 'inbound' | 'outbound';
  ignoredInboundRoutes?: string[];
  enabledOutboundHosts?: string[];
};

export type CORSOption = CorsOptions | CorsOptionsDelegate<any>;

type OpenApiServers = {
  url: string;
  description: string;
};

export type CommonModuleOptions = {
  appName?: string;
  appVersion?: string;
  appDescription?: string;
  environment?: string;
  openAPIRoute?: string;
  openApiServers?: OpenApiServers[];
  httpTrafficInspection?: HttpTrafficInspectionOptions;
  logger?: LoggerOptions;
  cors?: CORSOption;
  helmet?: Readonly<HelmetOptions>;
  compression?: compression.CompressionOptions;
  validationPipe?: ValidationPipeOptions;
  versioning?: VersioningOptions;
  routePrefix?: string;
};

export const InjectCommonModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN);

export interface CommonOptionsFactory {
  createOptions(): CommonModuleOptions | Promise<CommonModuleOptions>;
}
