import { IntegrationEvent } from '@fiap-x/tactical-design/core';

export class SnapshotsProcessed extends IntegrationEvent<{
  id: string;
  status: string;
  failReason?: string;
  provider?: string;
  bucket?: string;
  path?: string;
}> {}
