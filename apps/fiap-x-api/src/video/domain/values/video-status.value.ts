import { StatusTransitionException } from '../errors/status-transition.exception';

export enum EVideoStatus {
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Failed = 'FAILED',
}

export type VideoStatusValues = `${EVideoStatus}`;

export abstract class VideoStatus {
  protected abstract readonly _value: VideoStatusValues;

  static new() {
    return new PendingVideoStatus();
  }

  static create(value: VideoStatusValues) {
    const StatusMap: Record<VideoStatusValues, new () => VideoStatus> = {
      [EVideoStatus.Pending]: PendingVideoStatus,
      [EVideoStatus.Processed]: ProcessedVideoStatus,
      [EVideoStatus.Failed]: FailedVideoStatus,
    };
    const Status = StatusMap[value];
    if (!Status) {
      throw new Error(`Invalid Status Value: ${value}`);
    }
    return new Status();
  }

  get value() {
    return this._value;
  }

  pending(): VideoStatus {
    throw new StatusTransitionException(this._value, EVideoStatus.Pending);
  }
  processed(): VideoStatus {
    throw new StatusTransitionException(this._value, EVideoStatus.Processed);
  }
  failed(): VideoStatus {
    throw new StatusTransitionException(this._value, EVideoStatus.Failed);
  }
}

class PendingVideoStatus extends VideoStatus {
  protected readonly _value = EVideoStatus.Pending;

  processed() {
    return new ProcessedVideoStatus();
  }

  failed() {
    return new FailedVideoStatus();
  }
}

class ProcessedVideoStatus extends VideoStatus {
  protected readonly _value = EVideoStatus.Processed;
}

class FailedVideoStatus extends VideoStatus {
  protected readonly _value = EVideoStatus.Failed;
}
