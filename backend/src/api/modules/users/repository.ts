/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ICreateUser, IUser } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';
import {ErrorFactory, ErrorTypes} from '../../../utils';
import DefaultRepository from '../default-repo';
import { BaseRepo, BaseRepository } from '../baseRepo';
import User from './model';

// export default class UserRepository {
//   _model: BaseModel<IUser>;

//   constructor(model: BaseModel<IUser>) {
//     this._model = model;
//   }

//   async create(body: IUser, options?: { t: Transaction }) {
//     const user = await this._model.create(body, {
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     return user;
//   }

//   async findOne(query: Record<string, unknown>, options?: { t: Transaction }) {
//     const user = await this._model.findOne({
//       where: query,
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     return user;
//   }

//   async findById(id: string) {
//     const user = await this._model.findByPk(id, {});
//     return user;
//   }

//   async upsert(body: IUser) {
//     const record = await this._model.upsert(body);
//     return record;
//   }

//   async update(query: IUser, body: Partial<IUser>, options?: { t: Transaction }) {
//     const record = await this._model.findOne({
//       where: query,
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     if (!record) throw ErrorFactory.createError(ErrorTypes.NotFound, 'User not found!');
//     (record as unknown as { set: (value: Partial<IUser>) => void }).set(body);
//     await (record as unknown as { save: (args: { transaction?: Transaction }) => void }).save({
//       transaction: options?.t,
//     });
//     return record;
//   }

//   async findByEmail(email: string, options?: { t: Transaction }) {
//     const user = await this._model.findOne({
//       where: {
//         email,
//       },
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     return user;
//   }

//   async find(query: Record<string, unknown>, options?: { t: Transaction }) {
//     const user = await this._model.findAll({
//       where: query,
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     return user;
//   }


//   async delete(query: Partial<IUser>, options?: { t?: Transaction }) {
//     const record = await this._model.findOne({
//       where: query,
//       ...(options?.t ? { transaction: options.t } : {}),
//     });
//     if (!record) throw ErrorFactory.createError(ErrorTypes.NotFound, 'User not found!');
//     (record as unknown as { destroy: (args: { transaction?: Transaction; }) => void; }).destroy({
//       transaction: options?.t,
//     });
//     return record;
//   }
// }

export default class UserRepository extends DefaultRepository<User> implements BaseRepository<IUser, ICreateUser>{
  _model;

  constructor(model: typeof User){
    super();
    this._model = model;
  }
}