import { AuthUser, User, WithAuthentication } from '@fiap-x/setup/auth';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoCommand } from '../application/commands/create-video.command';
import { CreateVideoInput } from '../application/dtos/create-video.io';

@WithAuthentication()
@Controller({ version: '1', path: 'me/videos' })
export class CreateVideoController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async execute(@Body() input: CreateVideoInput, @AuthUser() user: User) {
    input.ownerId = user.id;
    const result = await this.commandBus.execute(new CreateVideoCommand(input));
    return result.data;
  }
}
