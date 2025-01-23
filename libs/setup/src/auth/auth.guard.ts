import { HttpService } from '@nestjs/axios';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User } from './user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    const authorization = request.get('Authorization');
    if (!authorization) {
      throw new UnauthorizedException();
    }
    await this.verifyToken(authorization);

    request.user = this.getUserFromToken(authorization);
    return true;
  }

  private getUserFromToken(authorization: string): User {
    const [, tokenBody] = authorization.split('.');
    const {
      sub: id,
      name,
      email,
    } = JSON.parse(Buffer.from(tokenBody, 'base64').toString('utf-8'));
    return new User({ id, name, email });
  }

  private async verifyToken(authorization: string): Promise<void> {
    const baseURLIdentityService = this.config.getOrThrow(
      'BASE_URL_IDENTITY_SERVICE',
    );
    const accessToken = authorization.replace('Bearer ', '');
    const res = await this.http.axiosRef
      .post(`${baseURLIdentityService}/v1/auth/verify`, { accessToken })
      .catch((err) => err.response);
    if (res.status !== HttpStatus.OK) {
      throw new UnauthorizedException();
    }
  }
}

export const WithAuthentication = () => applyDecorators(UseGuards(AuthGuard));
