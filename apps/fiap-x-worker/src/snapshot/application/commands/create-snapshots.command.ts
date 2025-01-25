import { VideoUploaded } from '../dtos/create-snapshots.io';

export class CreateSnapshotsCommand {
  currentAttempt: number;

  constructor(readonly event: VideoUploaded) {}
}
