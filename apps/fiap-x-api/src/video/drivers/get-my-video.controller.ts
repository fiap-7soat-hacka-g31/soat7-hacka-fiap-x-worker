import { AuthUser, User, WithAuthentication } from '@fiap-x/setup/auth';
import { ObjectIdValidationPipe } from '@fiap-x/tactical-design/mongoose';
import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMyVideoQuery } from '../application/query/get-my-video.query';

@WithAuthentication()
@Controller({ version: '1', path: 'me/videos' })
export class GetMyVideoController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async execute(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @AuthUser() user: User,
  ) {
    const result = await this.queryBus.execute(
      new GetMyVideoQuery({ id, ownerId: user.id }),
    );
    return result.data;
  }
}
