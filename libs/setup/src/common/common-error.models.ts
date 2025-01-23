import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiProperty,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type ExceptionFactoryOptions = {
  message: any;
  code: number;
};
const CommonExceptionFactory = ({ code, message }: ExceptionFactoryOptions) => {
  class CommonException {
    @ApiProperty({ example: message })
    message: string;

    @ApiProperty({ example: code })
    statusCode: number;

    @ApiProperty({ example: '608c3625-98ed-4c53-b598-51a827920feb' })
    trace: string;
  }
  return CommonException;
};

class BadRequestExceptionOutput {
  @ApiProperty({
    type: [String],
    example: ['email must be a valid email'],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: '608c3625-98ed-4c53-b598-51a827920feb' })
  trace: string;
}

export const ProducesServerExceptions = () =>
  ApiInternalServerErrorResponse({
    description: 'There was an error in the system',
    type: CommonExceptionFactory({
      message: 'Internal Server Error',
      code: 500,
    }),
  });

export const ProducesBadRequestExceptions = () =>
  ApiBadRequestResponse({
    description: 'Failed data validation',
    type: BadRequestExceptionOutput,
  });

export const ProducesUnauthorizedExceptions = () =>
  ApiUnauthorizedResponse({
    description: 'The operation was not authenticated',
    type: CommonExceptionFactory({ code: 401, message: 'Unauthorized' }),
  });

export const ProducesForbiddenExceptions = () =>
  ApiForbiddenResponse({
    description: 'Missing required permissions',
    type: CommonExceptionFactory({ code: 403, message: 'Forbidden' }),
  });

export const ProducesNotFoundExceptions = () =>
  ApiNotFoundResponse({
    // type: NotFoundExceptionOutput,
    description: 'The specified resource could not be found',
    type: CommonExceptionFactory({ code: 409, message: 'NotFound' }),
  });

export const ProducesConflictExceptions = () =>
  ApiConflictResponse({
    // type: ConflictExceptionOutput,
    description: 'The specified resource already exists',
    type: CommonExceptionFactory({ code: 409, message: 'Conflict' }),
  });

export const ProducesUnprocessableEntityExceptions = () =>
  ApiConflictResponse({
    // type: ConflictExceptionOutput,
    description: 'The specified operation cannot be processed',
    type: CommonExceptionFactory({ code: 422, message: 'UnprocessableEntity' }),
  });

// export const ProducesUnprocessableEntityExceptions = () =>
//   ApiResponse({
//     status: statusCode,
//     type: DomainException,
//     description: 'The request failed business rules',
//   });
// // export const ProducesDomainExceptions = (statusCode = 422) =>
// //   ApiResponse({
// //     status: statusCode,
// //     type: DomainException,
// //     description: 'The request failed business rules',
// //   });

// export const ProducesBadRequestExceptions = () =>
//   ApiBadRequestResponse({
//     type: BadRequestExceptionOutput,
//     description: 'The request failed data validation',
//   });

// export const ProducesNotFoundExceptions = () =>
//   ApiNotFoundResponse({
//     type: NotFoundExceptionOutput,
//     description: 'The specified resource does not exist',
//   });

// export const ProducesUnauthorizedExceptions = () =>
//   ApiUnauthorizedResponse({
//     type: UnauthorizedExceptionOutput,
//     description: 'Missing the required authorization',
//   });

// export const ProducesForbiddenExceptions = () =>
//   ApiForbiddenResponse({
//     type: ForbiddenExceptionOutput,
//     description: 'Missing required permissions on the specified resource',
//   });
