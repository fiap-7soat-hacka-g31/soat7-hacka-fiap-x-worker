import { BadRequestException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!this.isValid(value)) {
      throw new BadRequestException(
        `Provided ${value} is not a valid ObjectId hex string`,
      );
    }
    return value;
  }

  private isValid(value: string) {
    try {
      new Types.ObjectId(value);
      return true;
    } catch {
      return false;
    }
  }
}
