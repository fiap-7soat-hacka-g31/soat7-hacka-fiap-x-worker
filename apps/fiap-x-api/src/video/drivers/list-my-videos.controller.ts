import { AuthUser, User, WithAuthentication } from '@fiap-x/setup/auth';
import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListMyVideosQuery } from '../application/query/list-my-videos.query';

@WithAuthentication()
@Controller({ version: '1', path: 'me/videos' })
export class ListMyVideosController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async execute(@AuthUser() user: User) {
    const result = await this.queryBus.execute(
      new ListMyVideosQuery({ ownerId: user.id }),
    );
    return result;
  }
}
