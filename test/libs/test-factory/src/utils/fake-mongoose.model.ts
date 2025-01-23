export class FakeMongooseModel<T = any> {
  exec(): Promise<T | T[]> {
    return Promise.reject(new Error('Not Implemented'));
  }
  findById() {
    return this;
  }
  findOne() {
    return this;
  }
  find() {
    return this;
  }
}
