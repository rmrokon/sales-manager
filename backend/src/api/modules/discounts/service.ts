import { Transaction } from '@sequelize/core';
import { sequelize } from '../../../configs';
import { InternalServerError } from '../../../utils/errors';
import DiscountRepository from './repository';
import { IDiscount, IDiscountCreationBody, IDiscountUpdateBody } from './types';

interface IDataValues<T> {
  dataValues: T;
}

export default class DiscountService {
  _repo: DiscountRepository;

  constructor(repo: DiscountRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IDiscount>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createDiscount(body: IDiscountCreationBody, options?: { t: Transaction }) {
    const record = await this._repo.create(body, options);
    return this.convertToJson(record as IDataValues<IDiscount>)!;
  }

  async findDiscounts(query: Record<string, unknown>, options?: { t: Transaction }) {
    const discounts = await this._repo.find(query, options);
    return discounts.map(discount => this.convertToJson(discount as IDataValues<IDiscount>));
  }

  async findDiscountById(id: string) {
    const discount = await this._repo.findById(id);
    return discount ? this.convertToJson(discount as IDataValues<IDiscount>) : null;
  }

  async updateDiscount(id: string, body: IDiscountUpdateBody) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.update({id}, body, { t });
    });
    
    if (!success) throw new InternalServerError('Update discount failed');
    
    const updatedDiscount = await this.findDiscountById(id);
    return updatedDiscount;
  }

  async deleteDiscount(id: string) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.delete({id}, { t });
    });
    
    if (!success) throw new InternalServerError('Delete discount failed');
    
    return { success: true };
  }

  // async findActiveDiscounts(productId: string, companyId: string) {
  //   const discounts = await this._repo.findActiveDiscounts(productId, companyId);
  //   return discounts.map(discount => this.convertToJson(discount as IDataValues<IDiscount>));
  // }
}