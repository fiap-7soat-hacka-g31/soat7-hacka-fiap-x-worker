import {
  INestApplication,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MODULE_OPTIONS_TOKEN } from '../common/common.builder';
import { CommonModuleOptions } from '../common/common.options';
import { routeToRegex } from './http-inspector.utils';

@Injectable()
class HttpInspectorInboundMiddleware implements NestMiddleware {
  private readonly logger = new Logger('InboundHTTPInspection');

  constructor(private readonly ignoredRoutes: RegExp[]) {}

  private getLogLevel(res: Response) {
    const statusCode = res.statusCode;
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'log';
  }

  private shouldIgnoreRoute(req: Request) {
    return this.ignoredRoutes.some((x) => x.test(req.path.trim()));
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (this.shouldIgnoreRoute(req)) {
      return next();
    }

    let responseBody = null;
    const executionStartTimstamp = Date.now();
    const originalSend = res.send;
    res.send = (body) => {
      if (!responseBody) {
        responseBody = body;
      }
      res.send = originalSend;
      return res.send(body);
    };

    const originalJson = res.json;
    res.json = (body) => {
      if (!responseBody) {
        responseBody = body;
      }
      res.json = originalJson;
      return res.json(body);
    };

    this.logger.log({
      message: `[HTTP] [INBOUND] [REQUEST] [${req.method}] [${req.path}]`,
      http: {
        request: {
          ip: req.ip,
          method: req.method,
          path: req.path,
          baseURL: `${req.protocol}://${req.get('host')}`,
          headers: req.headers,
          body: req.body,
          query: req.query,
        },
      },
    });

    res.on('finish', () => {
      const executionTimeMillis = `${Date.now() - executionStartTimstamp}ms`;
      const logLevel = this.getLogLevel(res);
      this.logger[logLevel]({
        message: `[HTTP] [INBOUND] [RESPONSE] [${req.method}] [${req.path}] [${res.statusCode}] [${executionTimeMillis}]`,
        executionTime: executionTimeMillis,
        http: {
          request: {
            ip: req.ip,
            method: req.method,
            path: req.path,
            baseURL: `${req.protocol}://${req.get('host')}`,
            headers: req.headers,
            body: req.body,
            query: req.query,
          },
          response: {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.getHeaders(),
            body: responseBody,
          },
        },
      });
    });

    next();
  }
}

export const configureHttpInspectorInbound = (app: INestApplication) => {
  const options = app.get<CommonModuleOptions>(MODULE_OPTIONS_TOKEN);
  const { ignoredInboundRoutes: ignoreRoutes = [], mode = 'inbound' } =
    options.httpTrafficInspection ?? {};
  if (!['all', 'inbound'].includes(mode)) {
    return app;
  }

  ignoreRoutes.push('/docs*', '/favicon*');

  if (ignoreRoutes) {
    Logger.log(
      {
        message: 'HTTP Inspection is set to ignore routes',
        routes: ignoreRoutes,
      },
      'StartupUtils',
    );
  }

  const inspector = new HttpInspectorInboundMiddleware(
    ignoreRoutes.map(routeToRegex),
  );
  const middleware = inspector.use.bind(inspector);

  Object.defineProperty(middleware, 'name', {
    value: HttpInspectorInboundMiddleware.name,
  });
  app.use(middleware);
  Logger.log('Inbound http inspection initialized', 'StartupUtils');
  return app;
};
