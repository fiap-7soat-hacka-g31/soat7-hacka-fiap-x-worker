import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Context } from './context.model';

@Injectable()
export class ContextManager {
  private readonly context = new AsyncLocalStorage<Context>();

  isActive() {
    return Boolean(this.context.getStore());
  }

  getContext(): Context {
    const store = this.context.getStore();
    if (!store) {
      throw new Error('Context is not active!');
    }
    return store;
  }

  getContextOrDefault(): Context {
    const existingStore = this.context.getStore();
    if (existingStore) {
      return existingStore;
    }
    return Context.createNew();
  }

  run(store: Context, callback: () => void) {
    this.context.run(store, callback);
  }
}
