import { Transaction } from '@sequelize/core';
import ProductReturn from './model';
import { IProductReturn, ICreateProductReturn } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class ProductReturnRepository extends DefaultRepository<ProductReturn> implements BaseRepository<IProductReturn, ICreateProductReturn> {
  _model;
  constructor(model: typeof ProductReturn) {
    super();
    this._model = model;
  }

  async findByInvoiceId(invoiceId: string, options?: { t?: Transaction }) {
    return await this.find({ originalInvoiceId: invoiceId }, options);
  }

  async findByZoneId(zoneId: string, options?: { t?: Transaction }) {
    return await this.find({ zoneId }, options);
  }

  async findByStatus(status: string, options?: { t?: Transaction }) {
    return await this.find({ status }, options);
  }
}
