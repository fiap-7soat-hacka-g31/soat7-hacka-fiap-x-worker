import { ClientSession } from 'mongoose';
import { Transaction } from '../../core';

export class MongooseTransaction extends Transaction<ClientSession> {
  async begin(): Promise<void> {
    this._hostTransaction.startTransaction();
  }

  async commit(): Promise<void> {
    await this._hostTransaction.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this._hostTransaction.abortTransaction();
  }

  async end(): Promise<void> {
    await this._hostTransaction.endSession();
  }
}
