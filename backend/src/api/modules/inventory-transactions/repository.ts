import { Transaction } from '@sequelize/core';
import InventoryTransaction from './model';
import { IInventoryTransaction, ICreateInventoryTransaction } from './types';
import { BaseRepository } from '../baseRepo';
import DefaultRepository from '../default-repo';

export default class InventoryTransactionRepository extends DefaultRepository<InventoryTransaction> implements BaseRepository<IInventoryTransaction, ICreateInventoryTransaction> {
  _model: typeof InventoryTransaction;

  constructor(model: typeof InventoryTransaction) {
    super();
    this._model = model;
  }

  // async findByInvoiceId(invoiceId: string, options?: { t?: Transaction }) {
  //   return await this.find({ relatedInvoiceId: invoiceId }, options);
  // }

  // async findByReturnId(returnId: string, options?: { t?: Transaction }) {
  //   return await this.find({ relatedReturnId: returnId }, options);
  // }

  // async findByProductId(productId: string, options?: { t?: Transaction }) {
  //   return await this.find({ productId }, options);
  // }

  // async findByProvider(providerId: string, options?: { t?: Transaction }) {
  //   return await this.find({ providerId }, options);
  // }

  // async findByZone(zoneId: string, options?: { t?: Transaction }) {
  //   return await this.find({ zoneId }, options);
  // }
}
