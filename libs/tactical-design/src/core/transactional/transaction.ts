export abstract class Transaction<T = any> {
  constructor(protected readonly _hostTransaction: T) {}

  abstract begin(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract end(): Promise<void>;

  get hostTransaction(): T {
    return this._hostTransaction;
  }
}
