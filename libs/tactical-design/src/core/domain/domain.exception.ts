import { UnprocessableEntityException } from '@nestjs/common';

export class DomainException extends UnprocessableEntityException {
  constructor(message: string) {
    super(message);
  }
}
