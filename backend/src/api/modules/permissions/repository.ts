import { ICreatePermission, IPermission } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';
import { NotFound } from '../../../utils';
import DefaultRepository from '../default-repo';
import Permission from './model';
import { BaseRepository } from '../baseRepo';

export default class PermissionRepository extends DefaultRepository<Permission> implements BaseRepository<IPermission, ICreatePermission> {
  _model;

  constructor(model: typeof Permission) {
    super();
    this._model = model;
  }

  // async create(body: IPermission, options?: { t?: Transaction }) {
  //   const record = await this._model.create(body, {
  //     transaction: options?.t,
  //   });
  //   return record;
  // }

  // async update(query: IPermission, body: Partial<IPermission>, options?: { t?: Transaction }) {
  //   const record = await this.findOne({
  //     where: query,
  //     ...(options?.t ? { transaction: options.t } : {}),
  //   });
  //   if (!record) throw new NotFound('Permission not found!');
  //   (record as unknown as { set: (value: Partial<IPermission>) => void }).set(body);
  //   await (record as unknown as { save: (args: { transaction?: Transaction }) => void }).save({
  //     transaction: options?.t,
  //   });
  //   return record;
  // }

  // async upsert(body: IPermission) {
  //   const record = await this._model.upsert(body);
  //   return record;
  // }

  // async delete(query: IPermission, options?: { t?: Transaction }) {
  //   const record = await this.findOne({
  //     where: query,
  //     ...(options?.t ? { transaction: options.t } : {}),
  //   });
  //   if (!record) throw new NotFound('Permission not found!');
  //   await (record as unknown as { destroy: (args: { transaction?: Transaction }) => void }).destroy({
  //     transaction: options?.t,
  //   });
  //   return record;
  // }

  // async findById(id: string, options?: { t: Transaction }) {
  //   const record = await this._model.findOne({
  //     where: { id },
  //     ...(options?.t ? { transaction: options.t } : {}),
  //   });
  //   return record;
  // }

  // async findOne(query: Record<string, unknown>) {
  //   const record = await this._model.findOne(query);
  //   return record;
  // }

  // async find(query: Record<string, unknown>, options: { t: Transaction }) {
  //   const records = await this._model.findAll({
  //     where: query,
  //     ...(options?.t ? { transaction: options.t } : {}),
  //   });
  //   return records;
  // }
}
