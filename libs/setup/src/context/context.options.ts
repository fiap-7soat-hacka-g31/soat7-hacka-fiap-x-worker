import { ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { Context } from './context.model';
import { MODULE_OPTIONS_TOKEN } from './context.module-builder';

export type ContextMiddlewareSetup = (context: Context, req: Request) => void;

export type ContextInterceptorSetup = (
  context: Context,
  executionContext: ExecutionContext,
) => void;

export type ContextModuleOptions = {
  enableDebugLogs?: boolean;
  middlewareSetup?: ContextMiddlewareSetup;
  interceptorSetup?: ContextInterceptorSetup;
};

export const InjectContextModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN);
