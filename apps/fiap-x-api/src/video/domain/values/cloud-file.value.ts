export class CloudFile {
  constructor(
    private readonly _provider: string,
    private readonly _bucket: string,
    private readonly _path: string,
  ) {}

  get provider() {
    return this._provider;
  }

  get path() {
    return this._path;
  }

  get bucket() {
    return this._bucket;
  }
}
