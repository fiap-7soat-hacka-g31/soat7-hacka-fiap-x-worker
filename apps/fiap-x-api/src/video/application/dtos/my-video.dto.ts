import { ApiProperty } from '@nestjs/swagger';
import {
  EVideoStatus,
  VideoStatusValues,
} from '../../domain/values/video-status.value';

export class MyVideo {
  @ApiProperty()
  public readonly id: string;

  @ApiProperty()
  public readonly filename: string;

  @ApiProperty({ enum: EVideoStatus })
  public readonly status: VideoStatusValues;

  @ApiProperty()
  public readonly snapshotIntervalInSeconds: number;

  @ApiProperty()
  public readonly videoPath?: string;

  @ApiProperty()
  public readonly zipPath?: string;

  @ApiProperty()
  public readonly createdAt?: Date;

  @ApiProperty()
  public readonly updatedAt?: Date;

  constructor(values: MyVideo) {
    Object.assign(this, values);
  }
}
