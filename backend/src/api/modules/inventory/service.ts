import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInventoryCreationBody, IInventoryUpdateBody, IInventory } from './types';
import { sequelize } from '../../../configs';
import InventoryRepository from './repository';
import Product from '../products/model';
import Provider from '../providers/model';

export interface IInventoryService {
  findInventory(query: Record<string, unknown>): Promise<IInventory[]>;
  updateInventory(id: string, body: IInventoryUpdateBody): Promise<IInventory>;
  deleteInventory(id: string): Promise<{ success: boolean }>;
  createInventory(body: IInventoryCreationBody): Promise<IInventory>;
  findInventoryById(id: string): Promise<IInventory | null>;
}

export default class InventoryService implements IInventoryService {
  _repo: InventoryRepository;

  constructor(repo: InventoryRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IInventory>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createInventory(body: IInventoryCreationBody) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create inventory failed');
      return record as IDataValues<IInventory>;
    });
    return this.convertToJson(record) as IInventory;
  }

  async updateInventory(id: string, body: IInventoryUpdateBody) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update inventory failed');
    return this.convertToJson(record as IDataValues<IInventory>) as IInventory;
  }

  async deleteInventory(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findInventory(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [
        { model: Product },
        { model: Provider }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventory>)!);
  }

  async findInventoryById(id: string) {
    const record = await this._repo.findById(id);
    return record ? this.convertToJson(record as IDataValues<IInventory>) : null;
  }
}