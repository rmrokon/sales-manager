/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import { IRole, IRoleRequestBody } from './types';
import { sequelize } from '../../../configs';
import Role from './model';
import RoleRepository from './repository';

export interface IRoleService {
  findRoles(query: Record<string, unknown>): Promise<IRole[]>;
  updateRole(query: Partial<IRole> & { user_id?: string }, body: IRoleRequestBody): Promise<IRole>;
  deleteRole(query: Partial<IRole> & { user_id?: string }): Promise<IRole>;
  createRole(args: IRoleRequestBody & { user_id?: string }): Promise<IRole>;
}

export default class RoleService implements IRoleService {
  _repo: RoleRepository;

  constructor(repo: RoleRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IRole>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createRole(body: IRoleRequestBody) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create role failed');
      return record as IDataValues<IRole>;
    });
    return this.convertToJson(record) as IRole;
  }

  async createRoleRaw(body: IRoleRequestBody, options: { t: Transaction }) {
    const record = await this._repo.create(body, options);
    if (!record) throw new InternalServerError('Create role failed');
    return record;
  }

  async updateRole(query: Partial<IRole>, body: IRoleRequestBody) {
    const record = await this._repo.update(query, body);
    if (!record) throw new InternalServerError('Update role failed');
    return this.convertToJson(record as IDataValues<IRole>) as IRole;
  }

  async deleteRole(query: Partial<IRole>) {
    const record = await this._repo.delete(query);
    if (!record) throw new InternalServerError('Delete role failed');
    return this.convertToJson(record as IDataValues<IRole>) as IRole;
  }

  async findRoles(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records.map((record) => this.convertToJson(record as IDataValues<IRole>)!);
  }

  async findRolesRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records;
  }

  async findRoleByRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const record = await this._repo.findOne(query, options);
    return record as unknown as IDataValues<IRole>;
  }

  async findRoleRawById(id: string, options?: { t: Transaction }) {
    const record = await this._repo.findById(id, options);
    return record as unknown as IDataValues<IRole>;
  }

  async findByIdRawQuery(id: string, options: { t: Transaction }) {
    const record = await sequelize.query('SELECT * FROM `roles` where id = :id', {
      // @ts-ignore
      type: sequelize.QueryTypes.SELECT,
      replacements: { id },
      transaction: options.t,
      model: Role,
    });
    return record;
  }
}
