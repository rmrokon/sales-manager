import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IProductRequestBody, IProduct } from './types';
import { sequelize } from '../../../configs';
import ProductRepository from './repository';

export interface IProductService {
  findProducts(query: Record<string, unknown>): Promise<IProduct[]>;
  updateProduct(
    query: Partial<IProduct>,
    body: IProductRequestBody,
  ): Promise<IProduct>;
  deleteProduct(query: Partial<IProduct>): Promise<IProduct>;
  createProduct(args: IProductRequestBody & { company_id?: string; user_id?: string }): Promise<IProduct>;
  upsertProducts(body: IProductRequestBody): Promise<IProduct>;
}

export default class ProductService implements IProductService {
  _repo: ProductRepository;

  constructor(repo: ProductRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IProduct>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createProduct(body: IProductRequestBody & { company_id?: string; user_id?: string }) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create product failed');
      return record as IDataValues<IProduct>;
    });
    return this.convertToJson(record) as IProduct;
  }

  async updateProduct(query: Partial<IProduct>, body: IProductRequestBody) {
    const record = await this._repo.update(query, body);
    if (!record) throw new InternalServerError('Update product failed');
    return this.convertToJson(record as IDataValues<IProduct>) as IProduct;
  }

  async deleteProduct(query: Partial<IProduct>) {
    const record = await this._repo.delete(query);
    if (!record) throw new InternalServerError('Delete product failed');
    return this.convertToJson(record as IDataValues<IProduct>) as IProduct;
  }

  async findProducts(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records.map((record) => this.convertToJson(record as IDataValues<IProduct>)!);
  }

  async findProductsRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, options);
    return records as unknown as IDataValues<IProduct>;
  }

  async upsertProducts(body: IProductRequestBody) {
    const record = await this._repo.upsert(body);
    return this.convertToJson(record as unknown as IDataValues<IProduct>)!;
  }
}
