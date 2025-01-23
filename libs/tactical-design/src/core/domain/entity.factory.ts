import { Entity } from './entity';

export interface EntityFactory<TEntity extends Entity> {
  create(...args: any): TEntity | Promise<TEntity>;
}

export interface EntitySchemaFactory<TSchema, TEntity extends Entity> {
  entityToSchema(entity: TEntity): TSchema;
  schemaToEntity(entitySchema: TSchema): TEntity;
}
