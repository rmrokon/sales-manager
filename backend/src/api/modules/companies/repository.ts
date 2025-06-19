/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ICompany } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';
import {ErrorFactory, ErrorTypes} from '../../../utils';

export default class CompanyRepository {
  _model: BaseModel<ICompany>;

  constructor(model: BaseModel<ICompany>) {
    this._model = model;
  }

  async create(body: ICompany & {user_id: string}, options?: { t: Transaction }) {
    const company = await this._model.create(body, {
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return company;
  }

  async findOne(query: Record<string, unknown>, options?: { t: Transaction }) {
    const company = await this._model.findOne({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return company;
  }

  async findById(id: string) {
    const company = await this._model.findByPk(id, {});
    return company;
  }

  async upsert(body: ICompany) {
    const record = await this._model.upsert(body);
    return record;
  }

  async update(query: ICompany, body: Partial<ICompany>, options?: { t: Transaction }) {
    const record = await this._model.findOne({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    if (!record) throw ErrorFactory.createError(ErrorTypes.NotFound, 'Company not found!');
    (record as unknown as { set: (value: Partial<ICompany>) => void }).set(body);
    await (record as unknown as { save: (args: { transaction?: Transaction }) => void }).save({
      transaction: options?.t,
    });
    return record;
  }

  async findByEmail(email: string, options?: { t: Transaction }) {
    const company = await this._model.findOne({
      where: {
        email,
      },
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return company;
  }

  async find(query: Record<string, unknown>, options?: { t: Transaction }) {
    const companies = await this._model.findAll({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return companies;
  }


  async delete(query: Partial<ICompany>, options?: { t?: Transaction }) {
    const record = await this._model.findOne({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    if (!record) throw ErrorFactory.createError(ErrorTypes.NotFound, 'Company not found!');
    (record as unknown as { destroy: (args: { transaction?: Transaction; }) => void; }).destroy({
      transaction: options?.t,
    });
    return record;
  }
}
