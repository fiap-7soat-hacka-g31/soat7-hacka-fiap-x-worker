import {
  ListMyVideosInput,
  ListMyVideosOutput,
} from '../dtos/list-my-videos.io';

export class ListMyVideosQuery {
  constructor(public readonly data: ListMyVideosInput) {}
}

export class ListMyVideosResult {
  constructor(public readonly data: ListMyVideosOutput[]) {}
}
