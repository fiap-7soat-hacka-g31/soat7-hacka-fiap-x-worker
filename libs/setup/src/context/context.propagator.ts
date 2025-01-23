import { INestApplication, Logger } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';
import { ContextService } from './context.service';

function appendContextIdToHeaders(
  options: http.RequestOptions,
  contextId: string,
) {
  if (!options.headers) {
    options.headers = {};
  }
  options.headers['x-context-id'] = contextId;
}

function mountContextInterceptor(
  context: ContextService,
  module: typeof http | typeof https,
) {
  const withContextId = (target: typeof module.get | typeof module.request) =>
    function (...args: any[]) {
      const contextId = context.getId();
      if (!contextId) {
        return target.apply(this, args);
      }
      const [urlOrOptions, optionsOrCallback, maybeCallback] = args;
      // http.get(url, options, callback)
      if (typeof urlOrOptions === 'string' && maybeCallback) {
        appendContextIdToHeaders(optionsOrCallback, contextId);
        return target.apply(this, [
          urlOrOptions,
          optionsOrCallback,
          maybeCallback,
        ]);
      }
      // http.get(url, callback)
      if (typeof urlOrOptions === 'string') {
        const options = {};
        appendContextIdToHeaders(options, contextId);
        return target.apply(this, [urlOrOptions, options, optionsOrCallback]);
      }
      // http.get(options, callback)
      appendContextIdToHeaders(urlOrOptions, contextId);
      return target.apply(this, [urlOrOptions, optionsOrCallback]);
    };
  const targets = [
    { target: module.get, name: 'get' },
    { target: module.request, name: 'request' },
  ];
  for (const { target, name } of targets) {
    const contextifiedTarget = withContextId(target);
    Object.defineProperty(contextifiedTarget, 'name', {
      value: name,
      writable: false,
    });
    module[name] = contextifiedTarget;
  }
}

export const configureOutboundHttpContextPropagation = (
  app: INestApplication,
) => {
  const context = app.get(ContextService);
  for (const module of [http, https]) {
    mountContextInterceptor(context, module);
  }
  Logger.log('Http Context Propagation initialized', 'StartupUtils');
  return app;
};
