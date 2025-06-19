/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Transaction } from '@sequelize/core';
import { IDataValues } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import {
 ICompany,
 ICompanyCreationBody,
} from './types';

export interface ICompanyService {
  createCompany(args: ICompanyCreationBody): Promise<ICompany>;
  findCompanyByEmail(email: string, options?: { t: Transaction }): Promise<ICompany>;
  updateCompany(
    query: Partial<ICompanyCreationBody> & { id: string },
    body: Partial<ICompanyCreationBody>,
    options?: { t: Transaction },
  ): Promise<IDataValues<ICompany>>;
  find(query: Record<string, unknown>, options?: { t: Transaction }): Promise<Partial<ICompany>[]>;
  deleteCompany(id: string): Promise<Partial<ICompany>>;
}

export type ICompanyServiceRepo = BaseRepository<Partial<ICompany>> & {
  findByEmail(email: string, options?: { t: Transaction }): Promise<ICompany>;
};
export default class CompanyService implements ICompanyService {
  _repo: ICompanyServiceRepo;

  constructor(repo: ICompanyServiceRepo) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<ICompany>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createCompany(body: ICompanyCreationBody, options?: { t: Transaction }) {
    const company = await this._repo.create(body, options);
    return this.convertToJson(company as IDataValues<ICompany>)!;
  }

  async find(query: Record<string, unknown>, options?: { t: Transaction }) {
    const companies = await this._repo.find(query, options);
    return companies;
  }

  async createCompanyRaw(body: ICompanyCreationBody, options?: { t: Transaction }) {
    const company = await this._repo.create(body, options);
    return company as IDataValues<ICompany>;
  }

  async updateCompany(
    query: Partial<ICompanyCreationBody> & { id: string },
    body: Partial<ICompanyCreationBody>,
    options?: { t: Transaction },
  ) {
    const updatedCompany = await this._repo.update(query, body, options);
    return updatedCompany as IDataValues<ICompany>;
  }

  async findCompanyByEmail(email: string, options?: { t: Transaction }) {
    const company = await this._repo.findByEmail(email, options);
    return company;
  }

  async findCompanyById(id: string, options?: { t: Transaction }) {
    const company = await this._repo.findById(id, options);
    return this.convertToJson(company as unknown as IDataValues<ICompany>);
  }

  async findRawCompanyById(id: string, options?: { t: Transaction }) {
    const company = await this._repo.findOne({ id }, options);
    return company;
  }

  async deleteCompany(id: string): Promise<Partial<ICompany>> {
    const res = await this._repo.delete({id});
    return res;
  }
}