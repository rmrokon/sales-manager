import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import { IPermission, IPermissionRequestBody } from './types';
import { sequelize } from '../../../configs';
import PermissionRepository from './repository';

export interface IPermissionService {
  findPermissions(query: Record<string, unknown>): Promise<IPermission[]>;
  updatePermission(
    query: Partial<IPermission>,
    body: IPermissionRequestBody,
  ): Promise<IPermission>;
  deletePermission(query: Partial<IPermission>): Promise<IPermission>;
  createPermission(args: IPermissionRequestBody & { company_id?: string; user_id?: string }): Promise<IPermission>;
  upsertPermissions(body: IPermissionRequestBody): Promise<IPermission>;
}

export default class PermissionService implements IPermissionService {
  _repo: PermissionRepository;

  constructor(repo: PermissionRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IPermission>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createPermission(body: IPermissionRequestBody & { company_id?: string; user_id?: string }) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create permission failed');
      return record as IDataValues<IPermission>;
    });
    return this.convertToJson(record) as IPermission;
  }

  async updatePermission(query: Partial<IPermission>, body: IPermissionRequestBody) {
    const record = await this._repo.update(query, body);
    if (!record) throw new InternalServerError('Update permission failed');
    return this.convertToJson(record as IDataValues<IPermission>) as IPermission;
  }

  async deletePermission(query: Partial<IPermission>) {
    const record = await this._repo.delete(query);
    if (!record) throw new InternalServerError('Delete permission failed');
    return this.convertToJson(record as IDataValues<IPermission>) as IPermission;
  }

  async findPermissions(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records.map((record) => this.convertToJson(record as IDataValues<IPermission>)!);
  }

  async findPermissionsRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records as unknown as IDataValues<IPermission>;
  }

  async upsertPermissions(body: IPermissionRequestBody) {
    const record = await this._repo.upsert(body);
    return this.convertToJson(record as unknown as IDataValues<IPermission>)!;
  }
}
