import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';

export type ApiDocsOpts = {
  optional?: boolean;
};
export type ApiDocs = (opts?: ApiDocsOpts) => PropertyDecorator;

export const getTarget = (opts?: ApiDocsOpts) => {
  const { optional = false } = opts ?? {};
  return optional ? ApiPropertyOptional : ApiProperty;
};

export const WithApiProperty =
  (options?: ApiPropertyOptions, opts?: ApiDocsOpts): ApiDocs =>
  () => {
    const ApiPropertyTarget = getTarget(opts);
    return ApiPropertyTarget(options);
  };
