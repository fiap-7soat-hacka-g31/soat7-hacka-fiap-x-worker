export type CreateArchiveInput = {
  pathToArchive: string;
  outputFileName: string;
};

export abstract class ArchiveService {
  abstract createArchive(input: CreateArchiveInput): Promise<string>;
}
