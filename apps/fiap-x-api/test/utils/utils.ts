import { join } from 'path';

export const getVideoPath = () =>
  join(__dirname, '..', '..', '..', '..', 'test', 'resources', 'video.mp4');
