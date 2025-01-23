import { Inject } from '@nestjs/common';
import { TransactionManager } from './transaction.manager';

const InjectTransactionManager = () => Inject(TransactionManager);

export const Transactional = () => {
  const injectTransactionManager = InjectTransactionManager();
  return (
    target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    injectTransactionManager(target, TransactionManager.name);
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const transactionManager: TransactionManager =
        this[TransactionManager.name];
      if (!transactionManager) {
        return originalMethod.apply(this, args);
      }
      await transactionManager.beginTransaction();
      try {
        const result = await originalMethod.apply(this, args);
        await transactionManager.commitTransaction();
        return result;
      } catch (err) {
        await transactionManager.rollbackTransaction();
        throw err;
      }
    };
  };
};
