export type TakeSnapshotsInput = {
  pathToVideo: string;
  pathToSnapshotsDirectory: string;
  snapshotIntervalInSeconds: number;
};

export abstract class VideoProcessingService {
  abstract takeSnapshots(input: TakeSnapshotsInput): Promise<void>;
}
