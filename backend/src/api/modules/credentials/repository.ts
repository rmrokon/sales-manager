import { ICredential } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';

export default class CredentialRepository {
  _model: BaseModel<ICredential>;

  constructor(model: BaseModel<ICredential>) {
    this._model = model;
  }

  async create(data: ICredential, options?: { t: Transaction }) {
    const credential = await this._model.create(data, {
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return credential;
  }

  async update() {
    // TODO:
    return null as unknown as ICredential;
  }

  async delete() {
    // TODO:
    return null as unknown as ICredential;
  }

  async findOne(query: Record<string, unknown>, options?: { t: Transaction }) {
    const credential = await this._model.findOne({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return credential;
  }

  async upsert(body: ICredential) {
    const record = await this._model.upsert(body);
    return record;
  }

  async findById(id: string) {
    const credential = await this._model.findByPk(id, {});
    return credential;
  }

  async find(query: Record<string, unknown>, options?: { t: Transaction }) {
    const credential = await this._model.findAll({
      where: query,
      ...(options?.t ? { transaction: options.t } : {}),
    });
    return credential;
  }
}
