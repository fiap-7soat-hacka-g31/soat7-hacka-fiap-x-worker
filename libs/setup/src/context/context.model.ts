export enum ContextKeys {
  ContextId = '__ContextId__',
}

export class Context {
  constructor(private readonly state: Map<string, any>) {}

  /**
   * Creates a new context object
   */
  static createNew() {
    const state = new Map<string, any>();
    return new Context(state);
  }

  /**
   * Creates a clone of the existing context object
   */
  static clone(context: Context) {
    return new Context(new Map(context.state));
  }

  /**
   * Get the context id
   */
  getId() {
    return this.get<string>(ContextKeys.ContextId);
  }

  /**
   * Get the context id
   */
  setId(id: string) {
    return this.state.set(ContextKeys.ContextId, id);
  }

  /**
   * Retrieves value under a given key
   */
  get<T>(key: string): T {
    return this.state.get(key);
  }

  /**
   * Stores a given value under a given key. This method
   * is not collision free, be sure to have unique keys.
   */
  set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  /**
   * Deletes all keys in the context
   */
  clear() {
    this.state.clear();
  }
}
