import { DomainEvent } from '@fiap-x/tactical-design/core';

export class ProcessingFailed extends DomainEvent {
  constructor(public readonly reason: string) {
    super();
  }
}
