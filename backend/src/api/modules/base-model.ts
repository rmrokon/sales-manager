import { Model, Transaction } from '@sequelize/core';
import { CreationBody } from './baseRepo';

export abstract class BaseModel<T extends object, C extends object = CreationBody<T>> extends Model<T, C> {
  abstract create(body: C, options: { transaction?: Transaction }): Promise<T>;
  abstract bulkCreate(body: C[], options: { transaction?: Transaction }): Promise<T[]>;
  abstract findByPk(id: string, options: { transaction?: Transaction }): Promise<T>;
  abstract findOne(query: Record<string, unknown> & { transaction?: Transaction }): Promise<T>;
  abstract findAll(query: Record<string, unknown> & { transaction?: Transaction }): Promise<T[]>;
  abstract upsert(body: T): Promise<[T, boolean | null]>;
}
