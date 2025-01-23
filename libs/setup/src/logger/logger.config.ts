import { INestApplication, Logger } from '@nestjs/common';
import {
  WinstonModule,
  WinstonModuleOptions,
  utilities as nestWinstonUtils,
} from 'nest-winston';
import { config, format, transports } from 'winston';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';
import { Context } from '../context/context.model';
import { ContextService } from '../context/context.service';
import { Obfuscator, RegExpObfuscator } from './obfuscator';

let contextService: ContextService;
let anonymizer: Obfuscator;
let env: string;
let serviceName: string;

const { Console } = transports;
const { combine, timestamp, json } = format;
const { nestLike } = nestWinstonUtils.format;

const contextify = format((info) => {
  const context: Context =
    (info.error as any)?.context ?? contextService.getContext();
  const contextId = context.getId();
  return { ...info, contextId };
});

const commonSensitiveKeys = [
  /authorization/i,
  /password/i,
  /access.*token/i,
  /client.*secret/i,
  /.*api.*key/i,
  /.*card.*number/i,
];

let extraSensitiveKeys: (string | RegExp)[];

const sensitive = () =>
  format((info) => {
    const obfuscated = anonymizer.obfuscate(info, [
      ...(extraSensitiveKeys ?? []),
      ...commonSensitiveKeys,
    ]);
    return obfuscated;
  })();

const environment = () =>
  format((info) => {
    return { ...info, env };
  })();

const service = () =>
  format((info) => {
    return { ...info, service: serviceName };
  })();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const treatError = format(({ stack: _stack, error, ...info }) => {
  if (!error) {
    return info;
  }

  const err: any = error;
  const { innerException } = err;
  const exception = innerException ? { innerException } : {};
  return {
    ...info,
    error: {
      message: err.message,
      stack: err.stack,
      ...exception,
    },
  };
});

const preventDefault = format((info) => {
  /** TODO: this might hide uncatched errors */
  if (info.context === 'ExceptionsHandler') {
    return false;
  }
  return info;
});

const jsonFormat = () =>
  combine(
    preventDefault(),
    timestamp(),
    environment(),
    service(),
    contextify(),
    treatError(),
    sensitive(),
    json(),
  );

const prettyFormat = () =>
  combine(
    preventDefault(),
    timestamp(),
    environment(),
    service(),
    contextify(),
    treatError(),
    sensitive(),
    nestLike(serviceName),
  );

export const configureLogger = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  const {
    appName = 'unknown-app',
    environment = 'production',
    logger: loggerConfig = {},
  } = options;

  const {
    format = 'json',
    level = 'info',
    silent = false,
    obfuscation = {},
  } = loggerConfig;

  const {
    sensitiveKeys: anonymizeKeys = [],
    obfuscator: _anonymizer = new RegExpObfuscator(),
  } = obfuscation;

  contextService = app.get(ContextService);
  extraSensitiveKeys = anonymizeKeys;
  anonymizer = _anonymizer;
  const usePrettyFormat = format === 'pretty';

  env = environment;
  serviceName = appName;
  const winstonConfig: WinstonModuleOptions = {
    silent,
    levels: config.npm.levels,
    level,
    format: usePrettyFormat ? prettyFormat() : jsonFormat(),
    transports: [new Console()],
  };
  const logger = WinstonModule.createLogger(winstonConfig);
  app.useLogger(logger);
  Logger.log('Logger initialized', 'StartupUtils');
  return app;
};
