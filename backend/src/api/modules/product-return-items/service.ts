import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IProductReturnItem, IProductReturnItemCreationBody, IProductReturnItemUpdateBody } from './types';
import ProductReturnItemRepository from './repository';
import Product from '../products/model';

export interface IProductReturnItemService {
  findReturnItems(query: Record<string, unknown>): Promise<IProductReturnItem[]>;
  createReturnItem(body: IProductReturnItemCreationBody): Promise<IProductReturnItem>;
  createReturnItemInBulk(body: IProductReturnItemCreationBody[], t?: Transaction): Promise<IProductReturnItem[]>;
  updateReturnItem(id: string, body: IProductReturnItemUpdateBody): Promise<IProductReturnItem>;
  deleteReturnItem(id: string): Promise<{ success: boolean }>;
  findReturnItemById(id: string): Promise<IProductReturnItem | null>;
  findReturnItemsByReturn(returnId: string): Promise<IProductReturnItem[]>;
}

export default class ProductReturnItemService implements IProductReturnItemService {
  _repo: ProductReturnItemRepository;

  constructor(repo: ProductReturnItemRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IProductReturnItem>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createReturnItem(body: IProductReturnItemCreationBody) {
    const record = await this._repo.create(body);
    if (!record) throw new InternalServerError('Create return item failed');
    return this.convertToJson(record as IDataValues<IProductReturnItem>) as IProductReturnItem;
  }

  async createReturnItemInBulk(body: IProductReturnItemCreationBody[], t?: Transaction) {
    const records = await this._repo.bulkCreate(body, { t });
    if (!records) throw new InternalServerError('Create return items in bulk failed');
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturnItem>)!);
  }

  async updateReturnItem(id: string, body: IProductReturnItemUpdateBody) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update return item failed');
    return this.convertToJson(record as IDataValues<IProductReturnItem>) as IProductReturnItem;
  }

  async deleteReturnItem(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findReturnItems(query: Record<string, unknown>, options?: { t?: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [{ model: Product }]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturnItem>)!);
  }

  async findReturnItemById(id: string) {
    const records = await this._repo.find({ id }, {
      include: [{ model: Product }]
    });
    return records.length > 0 ? this.convertToJson(records[0] as IDataValues<IProductReturnItem>) : null;
  }

  async findReturnItemsByReturn(returnId: string) {
    const records = await this._repo.find({returnId}, {
      include: [{ model: Product }]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturnItem>)!);
  }
}
