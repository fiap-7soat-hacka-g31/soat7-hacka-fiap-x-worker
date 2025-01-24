import { AggregateEvent, DomainEvent } from '@fiap-x/tactical-design/core';
import { randomUUID } from 'crypto';

export class SnapshotsProcessed extends DomainEvent {
  constructor(
    public readonly id: string,
    public readonly status: string,
    public readonly failReason?: string,
    public readonly provider?: string,
    public readonly bucket?: string,
    public readonly path?: string,
  ) {
    super();
  }

  static createFailed(id: string, failedReason: string) {
    return this.createAggregateEvent(
      new SnapshotsProcessed(id, 'FAILED', failedReason),
    );
  }

  static createSuccess(
    id: string,
    provider: string,
    bucket: string,
    path: string,
  ) {
    return this.createAggregateEvent(
      new SnapshotsProcessed(id, 'SUCCESS', null, provider, bucket, path),
    );
  }

  private static createAggregateEvent(event: SnapshotsProcessed) {
    return new AggregateEvent(
      randomUUID(),
      event.id,
      SnapshotsProcessed.name,
      new Date(),
      0,
      event,
    );
  }
}
