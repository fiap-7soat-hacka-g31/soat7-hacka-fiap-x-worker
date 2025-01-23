import { DomainEvent } from '@fiap-x/tactical-design/core';

export abstract class FileUploaded extends DomainEvent {
  constructor(
    public readonly provider: string,
    public readonly bucket: string,
    public readonly path: string,
  ) {
    super();
  }
}
