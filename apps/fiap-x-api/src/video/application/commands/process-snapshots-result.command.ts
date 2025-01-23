import { SnapshotsProcessed } from '../dtos/snapshots-processed.io';

export class ProcessSnapshotsResultCommand {
  constructor(readonly event: SnapshotsProcessed) {}
}
