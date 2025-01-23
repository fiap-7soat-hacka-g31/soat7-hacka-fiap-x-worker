import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;

  constructor(values: User) {
    Object.assign(this, values);
  }
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
    return request.user;
  },
);
