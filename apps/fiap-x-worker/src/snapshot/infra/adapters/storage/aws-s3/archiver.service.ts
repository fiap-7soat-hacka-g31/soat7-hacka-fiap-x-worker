import { Injectable } from '@nestjs/common';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';
import {
  ArchiveService,
  CreateArchiveInput,
} from '../../../../application/abstractions/archive.service';

@Injectable()
export class ArchiveAdapterService implements ArchiveService {
  async createArchive(input: CreateArchiveInput): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const { pathToArchive, outputFileName } = input;
      const filename = outputFileName;
      const prefixPath = pathToArchive.startsWith('/') ? '/' : '';
      const outputPath = `${prefixPath}${join(
        ...pathToArchive.split('/').slice(0, -1),
        filename,
      )}`;
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => reject(err));
      output.on('error', (err) => reject(err));
      output.on('close', () => resolve(outputPath));
      archive.pipe(output);
      archive.directory(pathToArchive, false);
      await archive.finalize();
    });
  }
}
