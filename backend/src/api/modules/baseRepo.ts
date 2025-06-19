import { Transaction } from '@sequelize/core';

export abstract class BaseRepo<T extends object> {
  abstract find(): Promise<T[]>;
  abstract create(body: T): Promise<T>;
  abstract findById(id: number): Promise<T>;
  abstract findOneByIdAndUpdate(id: number, body: Partial<T>): Promise<T>;
  abstract findOneByIdAndRemove(id: number): Promise<T>;
}

export type CreationBody<
  T extends object,
  CreationOptionalKeys extends keyof T = keyof T & ('id' | 'createdAt' | 'updatedAt'),
> = Omit<T, CreationOptionalKeys> & Partial<Pick<T, CreationOptionalKeys>>;

export abstract class BaseRepository<T extends object, C extends object = CreationBody<T>> {
  abstract create(body: C, options?: { t?: Transaction }): Promise<T>;
  abstract update(query: Partial<T>, body: Partial<T>, options?: { t: Transaction }): Promise<T>;
  abstract delete(query: Partial<T>, options?: { t: Transaction }): Promise<T>;
  abstract findOne(query: Record<string, unknown>, options?: { t: Transaction }): Promise<T | null>;
  abstract findById(id: string, options?: { t: Transaction }): Promise<T | null>;
  abstract find(query: Record<string, unknown>, options?: { t: Transaction }): Promise<T[]>;
  abstract upsert(body: Partial<T>): Promise<[T, boolean | null]>;
}
