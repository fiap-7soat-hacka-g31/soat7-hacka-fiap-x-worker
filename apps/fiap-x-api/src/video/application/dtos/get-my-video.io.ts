import { MyVideo } from './my-video.dto';

export class GetMyVideosInput {
  public readonly id: string;
  public readonly ownerId: string;
}

export class GetMyVideosOutput extends MyVideo {}
