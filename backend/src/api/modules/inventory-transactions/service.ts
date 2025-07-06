import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInventoryTransaction, IInventoryTransactionCreationBody, TransactionType } from './types';
import { sequelize } from '../../../configs';
import InventoryTransactionRepository from './repository';
import Product from '../products/model';
import Provider from '../providers/model';
import Zone from '../zones/model';

export interface IInventoryTransactionService {
  findTransactions(query: Record<string, unknown>): Promise<IInventoryTransaction[]>;
  createTransaction(body: IInventoryTransactionCreationBody, options?: { t?: Transaction }): Promise<IInventoryTransaction>;
  createTransactionInBulk(transactions: IInventoryTransactionCreationBody[], t?: Transaction): Promise<IInventoryTransaction[]>;
  findTransactionsByInvoice(invoiceId: string): Promise<IInventoryTransaction[]>;
  findTransactionsByReturn(returnId: string): Promise<IInventoryTransaction[]>;
  findTransactionsByProduct(productId: string): Promise<IInventoryTransaction[]>;
}

export default class InventoryTransactionService implements IInventoryTransactionService {
  _repo: InventoryTransactionRepository;

  constructor(repo: InventoryTransactionRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IInventoryTransaction>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createTransaction(body: IInventoryTransactionCreationBody, options?: { t?: Transaction }) {
    const record = await this._repo.create(body, options);
    if (!record) throw new Error('Create inventory transaction failed');
    return this.convertToJson(record as IDataValues<IInventoryTransaction>) as IInventoryTransaction;
  }

  async createTransactionInBulk(transactions: IInventoryTransactionCreationBody[], t?: Transaction) {
    const records = await this._repo.bulkCreate(transactions, { t });
    return records.map(record => this.convertToJson(record as IDataValues<IInventoryTransaction>)!);
  }

  async findTransactions(query: Record<string, unknown>, options?: { t?: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [
        { model: Product },
        { model: Provider },
        { model: Zone }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventoryTransaction>)!);
  }

  async findTransactionsByInvoice(invoiceId: string) {
    const records = await this._repo.find({
      relatedInvoiceId: invoiceId
    },{
      include: [
        { model: Product },
        { model: Provider },
        { model: Zone }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventoryTransaction>)!);
  }

  async findTransactionsByReturn(returnId: string) {
    const records = await this._repo.find({
      relatedReturnId: returnId
    }, {
      include: [
        { model: Product },
        { model: Provider },
        { model: Zone }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventoryTransaction>)!);
  }

  async findTransactionsByProduct(productId: string) {
    const records = await this._repo.find({
      productId
    }, {
      include: [
        { model: Product },
        { model: Provider },
        { model: Zone }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventoryTransaction>)!);
  }
}
