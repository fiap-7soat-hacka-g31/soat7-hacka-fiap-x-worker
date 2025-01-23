import { Transaction } from './transaction';

export interface Connection {
  createTransaction(): Transaction;
}
