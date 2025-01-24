import { VideoUploaded } from '../dtos/create-snapshots.io';

export class CreateSnapshotsCommand {
  constructor(readonly event: VideoUploaded) {}
}
