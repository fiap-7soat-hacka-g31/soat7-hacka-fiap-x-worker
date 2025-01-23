/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Repository } from '@fiap-x/tactical-design/core';

export class FakeRepository<T extends Entity> implements Repository<T> {
  newId(): string {
    throw new Error('Method not implemented.');
  }
  create(entity: T): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(entity: T): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<T> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
}
