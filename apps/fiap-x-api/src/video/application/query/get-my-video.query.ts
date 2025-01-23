import { GetMyVideosInput, GetMyVideosOutput } from '../dtos/get-my-video.io';

export class GetMyVideoQuery {
  constructor(public readonly data: GetMyVideosInput) {}
}

export class GetMyVideoResult {
  constructor(public readonly data: GetMyVideosOutput) {}
}
