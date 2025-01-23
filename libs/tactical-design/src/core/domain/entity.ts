export abstract class Entity {
  constructor(protected readonly _id: string) {}

  get id() {
    return this._id;
  }
}
