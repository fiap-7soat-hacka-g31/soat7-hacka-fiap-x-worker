import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { FfprobeData } from 'fluent-ffmpeg';
import { join } from 'path';
import {
  TakeSnapshotsInput,
  VideoProcessingService,
} from '../../../../application/abstractions/video-processing.service';

@Injectable()
export class FFMPEGAdapterService implements VideoProcessingService {
  private readonly logger = new Logger(this.constructor.name);
  onModuleInit() {
    this.logger.log(`FFMPEG: ${ffmpegPath}`);
    this.logger.log(`FFPROBE: ${ffprobePath}`);
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
  }

  async takeSnapshots(input: TakeSnapshotsInput): Promise<void> {
    const { pathToSnapshotsDirectory, pathToVideo, snapshotIntervalInSeconds } =
      input;
    const info = await this.getVideoInfo(pathToVideo);
    const duration = info.format.duration;
    const snapshots = [];
    for (
      let currentTime = 0;
      currentTime < duration;
      currentTime += snapshotIntervalInSeconds
    ) {
      snapshots.push(
        this.extractSnapshot(
          pathToVideo,
          currentTime,
          pathToSnapshotsDirectory,
        ),
      );
    }
    await Promise.all(snapshots);
  }

  private extractSnapshot(
    videoPath: string,
    timemark: number,
    outDir: string,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .inputOptions([`-ss ${timemark}`]) // Fast seek to the timestamp
        .outputOptions(['-vframes 1']) // Extract a single frame
        .save(join(outDir, `frame_at_${timemark}.jpg`))
        .on('end', resolve)
        .on('error', reject);
    });
  }

  private getVideoInfo(videoPath: string): Promise<FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, info) => {
        if (!err) {
          return resolve(info);
        }
        /* istanbul ignore next */
        return reject(err);
      });
    });
  }
}
