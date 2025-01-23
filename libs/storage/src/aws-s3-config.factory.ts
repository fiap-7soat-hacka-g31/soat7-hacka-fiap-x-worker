import { S3, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsS3ConfigFactory {
  static createS3Client(config: ConfigService): S3Client {
    const useLocalstack =
      config.get('AWS_S3_USE_LOCALSTACK', 'false') === 'true';

    const s3Config = useLocalstack
      ? this.getLocalstackConfig(config)
      : this.getConfig(config);
    return new S3Client(s3Config);
  }

  static createS3(config: ConfigService): S3 {
    const useLocalstack =
      config.get('AWS_S3_USE_LOCALSTACK', 'false') === 'true';

    const s3Config = useLocalstack
      ? this.getLocalstackConfig(config)
      : this.getConfig(config);

    return new S3(s3Config);
  }

  private static getConfig(config: ConfigService): S3ClientConfig {
    return {
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
        sessionToken: config.get('AWS_SESSION_TOKEN'),
      },
    } as S3ClientConfig;
  }

  private static getLocalstackConfig(config: ConfigService): S3ClientConfig {
    const baseConfig = this.getConfig(config);
    return {
      ...baseConfig,
      endpoint: config.getOrThrow<string>('AWS_S3_LOCALSTACK_ENDPOINT'),
      forcePathStyle: true,
    };
  }
}
