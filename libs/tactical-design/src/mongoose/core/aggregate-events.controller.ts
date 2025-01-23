import { AggregateEvent, EventRepository } from '@fiap-x/tactical-design/core';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ObjectIdValidationPipe } from './object.id.validation.pipe';

@Controller('events')
@ApiTags('Events')
export class AggregateEventsController {
  constructor(private readonly eventsRepository: EventRepository) {}

  @Get(':aggregateId')
  @ApiOkResponse({ type: [AggregateEvent] })
  async getByAggregateId(
    @Param('aggregateId', new ObjectIdValidationPipe()) aggregateId,
  ) {
    return await this.eventsRepository.findByAggregateId(aggregateId);
  }
}
