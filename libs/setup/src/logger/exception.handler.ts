import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  INestApplication,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { isAxiosError } from 'axios';
import { Observable, catchError } from 'rxjs';
import { ContextService } from '../context/context.service';

@Injectable()
class CustomExceptionHandler implements NestInterceptor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly contextService: ContextService) {}

  private handleExceptionInRPCContext(rawError: any): RpcException {
    const logLevel =
      rawError.status < HttpStatus.INTERNAL_SERVER_ERROR ? 'debug' : 'error';
    // TODO: how to supress NestJS Default Exception Handler from logging too?
    const exception = new RpcException(rawError);
    exception.stack = rawError.stack;
    this.logger[logLevel]({ message: rawError.message, error: exception });
    return exception;
  }

  private getBody(rawError: any): any {
    // CHECKME: will other http clients need a workaround too?
    if (isAxiosError(rawError) || !rawError.response) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }

    return rawError.response;
  }

  private handleExceptionInHttpContext(rawError: any): HttpException {
    const body = this.getBody(rawError);
    body.trace = this.contextService.getId();
    const exception = new HttpException(body, body.statusCode);
    exception.stack = rawError.stack;
    const logLevel =
      body.statusCode < HttpStatus.INTERNAL_SERVER_ERROR ? 'debug' : 'error';
    this.logger[logLevel]({ message: rawError.message, error: exception });
    return exception;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((rawError) => {
        if (!['http', 'graphql'].includes(context.getType())) {
          // TODO: we must find a wai for these to prevent these errors from being logged in nest's defualt exception handler
          throw this.handleExceptionInRPCContext(rawError);
        }
        throw this.handleExceptionInHttpContext(rawError);
      }),
    );
  }
}

export const configureExceptionHandler = (app: INestApplication) => {
  const contextService = app.get(ContextService);
  app.useGlobalInterceptors(new CustomExceptionHandler(contextService));
  Logger.log('Exceptions handler initialized', 'StartupUtils');
  return app;
};
