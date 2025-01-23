import { MyVideo } from './my-video.dto';

export class ListMyVideosInput {
  public readonly ownerId: string;
}

export class ListMyVideosOutput extends MyVideo {}
