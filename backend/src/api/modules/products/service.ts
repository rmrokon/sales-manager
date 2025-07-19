import { Transaction, Op } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IProductRequestBody, IProduct } from './types';
import { sequelize } from '../../../configs';
import ProductRepository from './repository';

export interface IProductService {
  findProducts(query: Record<string, unknown>): Promise<IProduct[]>;
  findProductsWithPagination(query: Record<string, unknown>): Promise<any>;
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

  async createProduct(body: IProductRequestBody & { company_id?: string; user_id?: string; providerIds?: string[] }) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create product failed');

      // Associate providers if providerIds are provided
      if (body.providerIds && body.providerIds.length > 0) {
        await record.setProviders(body.providerIds, { transaction: t });
      }

      return record as IDataValues<IProduct>;
    });
    return this.convertToJson(record) as IProduct;
  }

  async updateProduct(
    query: Partial<IProduct>,
    body: IProductRequestBody & { providerIds?: string[] },
  ) {
    const record = await sequelize.transaction(async (t) => {
      // Ensure backward compatibility: if only price is provided, use it for both purchase and selling
      const productData = {
        ...body,
        purchasePrice: body.purchasePrice || body.price,
        sellingPrice: body.sellingPrice || body.price,
      };

      const updatedProduct = await this._repo.update(query, productData, { t });
      if (!updatedProduct) throw new InternalServerError('Update product failed');

      // Get the product record
      const product = await this._repo.findOne(query, { t });
      if (!product) throw new InternalServerError('Product not found after update');

      // Update provider associations if providerIds are provided
      if (body.providerIds !== undefined) {
        await product.setProviders(body.providerIds, { transaction: t });
      }

      return product as IDataValues<IProduct>;
    });
    return this.convertToJson(record) as IProduct;
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

  async findProductsWithPagination(query: Record<string, unknown>, options?: { t: Transaction }) {
    // Extract filter parameters
    const { search, dateFrom, dateTo, date, ...otherQuery } = query;

    // Build base where conditions
    const baseConditions: any = { ...otherQuery };

    // Build final where conditions
    let whereConditions: any = baseConditions;

    // Add search conditions
    if (search) {
      const searchConditions = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };

      // If we have other conditions, combine them with AND
      if (Object.keys(baseConditions).length > 0) {
        whereConditions = {
          [Op.and]: [baseConditions, searchConditions]
        };
      } else {
        whereConditions = searchConditions;
      }
    }

    // Add date filtering
    if (date) {
      // Single date - filter for that specific day
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);

      whereConditions.createdAt = {
        [Op.between]: [startOfDay, endOfDay]
      };
    } else if (dateFrom || dateTo) {
      // Date range filtering
      const dateFilter: any = {};
      if (dateFrom) {
        const startDate = new Date(dateFrom as string);
        startDate.setHours(0, 0, 0, 0);
        dateFilter[Op.gte] = startDate;
      }
      if (dateTo) {
        const endDate = new Date(dateTo as string);
        endDate.setHours(23, 59, 59, 999);
        dateFilter[Op.lte] = endDate;
      }
      whereConditions.createdAt = dateFilter;
    }

    const result = await this._repo.findWithPagination(whereConditions, options);

    return {
      ...result,
      nodes: result.nodes.map((record) => this.convertToJson(record as IDataValues<IProduct>)!)
    };
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
