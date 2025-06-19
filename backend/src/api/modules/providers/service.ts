import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IProviderRequestBody, IProvider } from './types';
import { sequelize } from '../../../configs';
import ProviderRepository from './repository';

export interface IProviderService {
  findProviders(query: Record<string, unknown>): Promise<IProvider[]>;
  updateProvider(
    query: Partial<IProvider>,
    body: IProviderRequestBody,
  ): Promise<IProvider>;
  deleteProvider(query: Partial<IProvider>): Promise<IProvider>;
  createProvider(args: IProviderRequestBody & { company_id?: string; user_id?: string }): Promise<IProvider>;
  upsertProviders(body: IProviderRequestBody): Promise<IProvider>;
}

export default class ProviderService implements IProviderService {
  _repo: ProviderRepository;

  constructor(repo: ProviderRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IProvider>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createProvider(body: IProviderRequestBody & { company_id?: string; user_id?: string }) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create provider failed');
      return record as IDataValues<IProvider>;
    });
    return this.convertToJson(record) as IProvider;
  }

  async updateProvider(query: Partial<IProvider>, body: IProviderRequestBody) {
    const record = await this._repo.update(query, body);
    if (!record) throw new InternalServerError('Update provider failed');
    return this.convertToJson(record as IDataValues<IProvider>) as IProvider;
  }

  async deleteProvider(query: Partial<IProvider>) {
    const record = await this._repo.delete(query);
    if (!record) throw new InternalServerError('Delete provider failed');
    return this.convertToJson(record as IDataValues<IProvider>) as IProvider;
  }

  async findProviders(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records.map((record) => this.convertToJson(record as IDataValues<IProvider>)!);
  }

  async findProvidersRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records as unknown as IDataValues<IProvider>;
  }

  async upsertProviders(body: IProviderRequestBody) {
    const record = await this._repo.upsert(body);
    return this.convertToJson(record as unknown as IDataValues<IProvider>)!;
  }
}
