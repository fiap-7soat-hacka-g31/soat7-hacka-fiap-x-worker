import { Injectable } from '@nestjs/common';
import { ContextManager } from './context.manager';
import { Context } from './context.model';

@Injectable()
export class ContextService {
  constructor(private readonly context: ContextManager) {}

  private getStore(strict = false) {
    return strict
      ? this.context.getContext()
      : this.context.getContextOrDefault();
  }
  /**
   * Retrieves a previously stored value under the specified key.
   */
  get<T>(key: string, strict = false): T {
    const store = this.getStore(strict);
    return store.get(key);
  }

  /**
   * Retrieves the current running context id.
   */
  getId(strict = false) {
    return this.getStore(strict).getId();
  }

  /**
   * Stores a given value under a given key. This method
   * is not collision free, be sure to have unique keys.
   */
  set<T>(key: string, value: T): void {
    const store = this.context.getContext();
    store.set(key, value);
  }

  /**
   * Returns a copy of the current running context.
   */
  getContext() {
    const store = this.getStore();
    return Context.clone(store);
  }
}
