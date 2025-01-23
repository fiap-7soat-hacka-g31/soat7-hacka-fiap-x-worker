import { Injectable } from '@nestjs/common';
import { ClientSession, FilterQuery, Model, Types } from 'mongoose';
import {
  AggregateMergeContext,
  AggregateRoot,
  Entity,
  EntitySchemaFactory,
  Repository,
  TransactionManager,
} from '../../core';
import { MongooseEntitySchema } from './entity.schema';

@Injectable()
export abstract class MongooseRepository<
  TSchema extends MongooseEntitySchema,
  TEntity extends Entity,
> implements Repository<TEntity>
{
  constructor(
    protected readonly mergeContext: AggregateMergeContext,
    protected readonly transactionManager: TransactionManager,
    protected readonly entityModel: Model<TSchema>,
    protected readonly entitySchemaFactory: EntitySchemaFactory<
      TSchema,
      TEntity
    >,
  ) {}

  newId(): string {
    return new Types.ObjectId().toHexString();
  }

  async findById(id: string): Promise<TEntity> {
    return this.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async findAll(): Promise<TEntity[]> {
    return this.find({});
  }

  private merge(entity: TEntity) {
    if (entity instanceof AggregateRoot) {
      this.mergeContext.mergeObjectContext(entity);
    }
    return entity;
  }

  protected async find(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEntity[]> {
    const schemas = await this.entityModel
      .find(entityFilterQuery, {}, { lean: true })
      .exec();
    return schemas.map((schema) =>
      this.merge(this.entitySchemaFactory.schemaToEntity(schema as TSchema)),
    );
  }

  async create(entity: TEntity): Promise<void> {
    const session = this.getSession();
    const schema = this.entitySchemaFactory.entityToSchema(entity);
    await new this.entityModel(schema).save({ session });
    this.merge(entity);
  }

  async update(entity: TEntity): Promise<void> {
    const session = this.getSession();
    const schema = this.entitySchemaFactory.entityToSchema(entity);
    await this.entityModel.updateOne({ _id: schema._id }, schema, { session });
  }

  protected async findOne(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEntity> {
    const schema = await this.entityModel
      .findOne(entityFilterQuery, {}, { lean: true })
      .exec();

    if (!schema) {
      return;
    }

    return this.merge(
      this.entitySchemaFactory.schemaToEntity(schema as TSchema),
    );
  }

  protected getSession(): ClientSession | undefined {
    return this.transactionManager.getRunningTransactionOrDefault()
      ?.hostTransaction;
  }
}
