import { Constructor } from '@nestjs/cqrs';
import { AggregateEvent, DomainEvent } from '../core';

export function toDottedNotation(value: string) {
  const values = [value[0].toLowerCase()];
  for (let i = 1; i < value.length; i++) {
    const thisCharacter = value[i];
    if (['-', '.', '_'].includes(thisCharacter)) {
      values.push('.');
    } else if (thisCharacter === thisCharacter.toUpperCase()) {
      values.push('.', thisCharacter.toLowerCase());
    } else {
      values.push(thisCharacter);
    }
  }
  return values.join('');
}

export function routingKeyOfEvent(
  event: DomainEvent | Constructor<DomainEvent>,
): string {
  const isInstance =
    event instanceof DomainEvent || event instanceof AggregateEvent;
  const eventName = isInstance ? event.constructor.name : event.name;
  const baseNameWithoutSuffix = eventName.replace(/Event$/g, '');
  const values = [baseNameWithoutSuffix[0].toLowerCase()];
  for (let i = 1; i < baseNameWithoutSuffix.length; i++) {
    const thisCharacter = baseNameWithoutSuffix[i];
    if (thisCharacter === thisCharacter.toUpperCase()) {
      values.push('.', thisCharacter.toLowerCase());
    } else {
      values.push(thisCharacter);
    }
  }
  return values.join('');
}

export function routingKeyOf(eventName: string): string {
  const baseNameWithoutSuffix = eventName.replace(/Event$/g, '');
  const values = [baseNameWithoutSuffix[0].toLowerCase()];
  for (let i = 1; i < baseNameWithoutSuffix.length; i++) {
    const thisCharacter = baseNameWithoutSuffix[i];
    if (thisCharacter === thisCharacter.toUpperCase()) {
      values.push('.', thisCharacter.toLowerCase());
    } else {
      values.push(thisCharacter);
    }
  }
  return values.join('');
}
