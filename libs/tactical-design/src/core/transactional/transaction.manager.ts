import { ContextService } from '@fiap-x/setup';
import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction';

@Injectable()
export abstract class TransactionManager {
  private readonly key: string = `${this.constructor.name}}`;

  constructor(protected readonly context: ContextService) {}

  abstract createTransaction(): Promise<Transaction>;

  getRunningTransactionOrDefault(): Transaction {
    return this.context.get(this.key);
  }

  async beginTransaction(): Promise<void> {
    const existingTransaction = this.context.get(this.key);
    if (existingTransaction) {
      throw new Error('Transaction is already running for the current context');
    }
    const transaction = await this.createTransaction();
    await transaction.begin();
    this.context.set(this.key, transaction);
  }

  async commitTransaction(): Promise<void> {
    const transaction = this.getRunningTransactionOrFail();

    await transaction.commit();
    await transaction.end();
  }

  async rollbackTransaction(): Promise<void> {
    const transaction = this.getRunningTransactionOrFail();
    await transaction.rollback();
    await transaction.end();
  }

  private getRunningTransactionOrFail() {
    const transaction = this.context.get<Transaction>(this.key);
    if (!transaction) {
      throw new Error('Transaction is not running for the current context');
    }
    return transaction;
  }
}
