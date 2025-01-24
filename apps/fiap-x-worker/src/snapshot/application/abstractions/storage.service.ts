export type CloudFile = {
  provider: string;
  bucket: string;
  path: string;
};

export abstract class StorageService {
  abstract createDirectory(path: string): Promise<void>;
  abstract removeDirectory(path: string): Promise<void>;
  abstract uploadFileFromPath(path: string, cloudPath: string): Promise<void>;
  abstract downloadFileToPath(
    file: CloudFile,
    pathToDownload: string,
  ): Promise<string>;
}
