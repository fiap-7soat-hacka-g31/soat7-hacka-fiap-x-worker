import { INestApplication, Logger } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';
import {
  logRequest,
  logRequestError,
  logResponse,
  routeToRegex,
} from './http-inspector.utils';

const handleResponse =
  (logger: Logger, callback: (res: http.IncomingMessage) => void) =>
  (res: http.IncomingMessage) => {
    const dataChunks = [];
    res.on('data', (chunk) => dataChunks.push(chunk));
    res.on('end', () => {
      logResponse(res, dataChunks, logger);
    });
    res.on('error', (error) => {
      logResponse(res, dataChunks, logger, error);
    });
    callback(res);
  };

const withTrafficInspection = (
  logger: Logger,
  target:
    | typeof http.request
    | typeof https.request
    | typeof http.get
    | typeof https.get,
  enabledOutboundHosts: RegExp[],
) =>
  function (...args: any[]) {
    const [urlOrOptions, callbackOrOptions, maybeCallback] = args;
    const requestDataChunks = [];
    const callback = maybeCallback || callbackOrOptions;
    const shouldIgnoreRoute = () => {
      const target = (
        typeof urlOrOptions === 'string'
          ? new URL(urlOrOptions).hostname
          : urlOrOptions.hostname
      )?.trim();
      return !enabledOutboundHosts.some((x) => x.test(target));
    };

    if (shouldIgnoreRoute()) {
      return target.apply(this, args);
    }
    let request: http.ClientRequest;
    const wrappedCallback = () => handleResponse(logger, callback);
    if (typeof urlOrOptions === 'string' && maybeCallback) {
      request = target.apply(this, [
        urlOrOptions,
        callbackOrOptions,
        wrappedCallback(),
      ]);
    } else {
      request = target.apply(this, [urlOrOptions, wrappedCallback()]);
    }
    request['__META__'] = { executionStartTimestamp: Date.now() };
    const originalWrite = request.write;
    request.write = function write(...args: any[]) {
      const [chunk] = args;
      requestDataChunks.push(chunk);
      return originalWrite.apply(this, args);
    };
    request.on('error', (error) => {
      logRequestError(request, requestDataChunks, logger, error);
    });
    request.on('finish', () => {
      request['__META__'].request = logRequest(
        request,
        requestDataChunks,
        logger,
      );
    });

    return request;
  };

function mountInterceptor(
  logger: Logger,
  module: typeof http | typeof https,
  enabledOutboundHosts: RegExp[],
) {
  for (const { target, name } of [
    { target: module.get, name: 'get' },
    { target: module.request, name: 'request' },
  ]) {
    const inspectedTarget = withTrafficInspection(
      logger,
      target,
      enabledOutboundHosts,
    );
    Object.defineProperty(inspectedTarget, 'name', {
      value: name,
      writable: false,
    });
    module[name] = inspectedTarget;
  }
}

export const configureHttpInspectorOutbound = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  const { mode, enabledOutboundHosts } = options.httpTrafficInspection ?? {};
  if (!['all', 'outbound'].includes(mode)) {
    return app;
  }
  const logger = new Logger('OutboundHTTPInspection');
  for (const module of [http, https]) {
    mountInterceptor(logger, module, enabledOutboundHosts?.map(routeToRegex));
  }
  logger.log('Outbound http inspection initialized', 'StartupUtils');
  return app;
};
