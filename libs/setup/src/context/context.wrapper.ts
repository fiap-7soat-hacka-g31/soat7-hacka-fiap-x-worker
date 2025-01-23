import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestMiddleware,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs';
import { ContextManager } from './context.manager';
import { Context } from './context.model';
import {
  ContextInterceptorSetup,
  ContextModuleOptions,
  InjectContextModuleOptions,
} from './context.options';

const KEY = 'StartupUtils';

type ReloadContextMetadata = {
  interceptorSetup?: ContextInterceptorSetup;
};

export const ReloadContext = (opts: ReloadContextMetadata) =>
  SetMetadata(KEY, opts);

@Injectable()
export class ContextWrapper implements NestMiddleware, NestMiddleware {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly context: ContextManager,
    @InjectContextModuleOptions()
    private readonly options: ContextModuleOptions,
  ) {
    if (!options.enableDebugLogs) {
      this.logger.debug = () => null;
    }
  }

  private addContextIdOrDefault(
    store: Context,
    existingId: string = randomUUID(),
  ) {
    const id = store.getId();
    if (!id) {
      store.setId(existingId);
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug('Context was initialized');
    const { middlewareSetup: mountMiddlewareFromModule = () => null } =
      this.options;
    const store = this.context.getContextOrDefault();
    const id = req.get('x-context-id');
    mountMiddlewareFromModule(store, req);
    this.addContextIdOrDefault(store, id);
    this.context.run(store, async () => next());
  }

  intercept(
    executionContext: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    if (this.context.isActive()) {
      return next.handle();
    }
    this.logger.debug('Context was initialized');
    const fallbackSetup = () => null;
    const { interceptorSetup: mountInterceptorFromModule = fallbackSetup } =
      this.options;
    const context = this.context.getContextOrDefault();
    const { interceptorSetup: mountInterceptorFromDecorator = fallbackSetup } =
      this.reflector.get<ReloadContextMetadata>(
        KEY,
        executionContext.getHandler(),
      ) ?? {};
    mountInterceptorFromModule(context, executionContext);
    /**
     * TODO: needs improvement, for reloading rpc contexts
     * we depend on libs to implement it. Neither bad nor good.
     * We expose interface, dependant libs implement it.
     */
    mountInterceptorFromDecorator(context, executionContext);
    this.addContextIdOrDefault(context, context.getId());
    return new Observable((subscriber) => {
      this.context.run(context, async () =>
        next
          .handle()
          .pipe()
          .subscribe({
            next: (d) => subscriber.next(d),
            complete: () => subscriber.complete(),
            error: (e) => {
              e.context = Context.clone(context);
              return subscriber.error(e);
            },
          }),
      );
    });
  }
}
