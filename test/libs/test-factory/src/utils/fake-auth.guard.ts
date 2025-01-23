import { User } from '@fiap-x/setup/auth';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Types } from 'mongoose';

/**
 * WIP
 */

@Injectable()
export class FakeAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    const random = randomUUID().split('-').at(0);
    const user = new User({
      id: new Types.ObjectId().toHexString(),
      email: `${random}jack@sparrow.com`,
      name: 'Jack Sparrow ${random}',
    });

    request.user = user;
    return true;
  }
}

export const WithAuthentication = () =>
  applyDecorators(UseGuards(FakeAuthGuard));
