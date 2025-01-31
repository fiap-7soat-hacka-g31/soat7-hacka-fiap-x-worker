export type FileUploadInput = {
  bucket: string;
  key: string;
  content: Buffer<ArrayBufferLike>;
};

export type FileDownloadInput = {
  bucket: string;
  key: string;
  downloadToPath: string;
};

export type FileInfoInput = {
  bucket: string;
  key: string;
};
export type FileInfoOutput = {
  contentType: string;
  contentLength: number;
};

export type SignedUrlOutput = {
  provider: string;
  bucket: string;
  key: string;
  signedUrl: string;
};

export type FileUploadOutput = {
  provider: string;
  bucket: string;
  key: string;
};
