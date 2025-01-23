import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVideoInput {
  ownerId: string;

  @IsString()
  filename: string;

  @IsInt()
  @IsOptional()
  @Type(/* istanbul ignore next */ () => Number)
  snapshotIntervalInSeconds?: number;
}

export class CreateVideoOutput {
  id: string;
  signedUrlForUpload: string;
}
