export type CreateSignedUrlForUploadResult = {
  provider: string;
  bucket: string;
  path: string;
  signedUrl: string;
};

export abstract class StorageService {
  abstract createSignedUrlForUpload(
    path: string,
  ): Promise<CreateSignedUrlForUploadResult>;
}
