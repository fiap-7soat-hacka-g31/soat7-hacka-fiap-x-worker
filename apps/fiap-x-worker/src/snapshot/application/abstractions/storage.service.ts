export type CloudFile = {
  provider: string;
  bucket: string;
  path: string;
};

export type FileInfo = {
  contentType: string;
  contentLength: number;
};

export abstract class StorageService {
  abstract createDirectory(path: string): Promise<void>;
  abstract removeDirectory(path: string): Promise<void>;
  abstract getFileInfo(file: CloudFile): Promise<FileInfo>;
  abstract uploadFileFromPath(path: string, cloudPath: string): Promise<void>;
  abstract downloadFileToPath(
    file: CloudFile,
    pathToDownload: string,
  ): Promise<void>;
}
