export class FakeTransactionManager {
  async beginTransaction() {
    return Promise.resolve();
  }
  async commitTransaction() {
    return Promise.resolve();
  }
  async rollbackTransaction() {
    return Promise.resolve();
  }
}
