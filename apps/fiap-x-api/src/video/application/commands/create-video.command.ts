import { CreateVideoInput, CreateVideoOutput } from '../dtos/create-video.io';

export class CreateVideoCommand {
  constructor(readonly data: CreateVideoInput) {}
}

export class CreateVideoResult {
  constructor(readonly data: CreateVideoOutput) {}
}
