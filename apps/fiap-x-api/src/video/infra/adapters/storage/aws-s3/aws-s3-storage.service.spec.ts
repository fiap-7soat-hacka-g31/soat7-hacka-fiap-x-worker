import { AwsS3StorageService } from '@fiap-x/storage';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../../../../application/abstractions/storage.service';
import { AwsS3VideoStorageService } from './aws-s3-storage.service';

describe('StorageService', () => {
  let target: StorageService;
  let provider: AwsS3StorageService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: AwsS3StorageService,
          useValue: Object.create(AwsS3StorageService.prototype),
        },
        {
          provide: StorageService,
          useClass: AwsS3VideoStorageService,
        },
      ],
    }).compile();

    target = app.get(StorageService);
    provider = app.get(AwsS3StorageService);
  });

  it('should upload video and return its metadata', async () => {
    jest.spyOn(provider, 'createSignedUrlForUpload').mockResolvedValue({
      provider: 'dummy',
      bucket: 'dummy',
      key: 'dummy/file.mp4',
      signedUrl: 'dummy',
    });
    const result = await target.createSignedUrlForUpload('userid/video.mp4');
    expect(result.provider).toBeDefined();
    expect(result.bucket).toBeDefined();
    expect(result.path).toBeDefined();
  });
});
