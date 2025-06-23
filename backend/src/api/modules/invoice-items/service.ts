import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInvoiceItemCreationBody, IInvoiceItemUpdateBody, IInvoiceItem } from './types';
import { sequelize } from '../../../configs';
import InvoiceItemRepository from './repository';
import Product from '../products/model';
import Invoice from '../invoices/model';
import InvoiceService from '../invoices/service';

export interface IInvoiceItemService {
  findInvoiceItems(query: Record<string, unknown>): Promise<IInvoiceItem[]>;
  updateInvoiceItem(id: string, body: IInvoiceItemUpdateBody): Promise<IInvoiceItem>;
  deleteInvoiceItem(id: string): Promise<{ success: boolean }>;
  createInvoiceItem(body: IInvoiceItemCreationBody): Promise<IInvoiceItem>;
  findInvoiceItemById(id: string): Promise<IInvoiceItem | null>;
  findInvoiceItemsByInvoiceId(invoiceId: string): Promise<IInvoiceItem[]>;
  // createInvoiceItemInBulk(body: IInvoiceItemCreationBody[], transaction?: Transaction): Promise<IInvoiceItem[]>
}

export default class InvoiceItemService implements IInvoiceItemService {
  _repo: InvoiceItemRepository;
  _invoiceService: InvoiceService;

  constructor(repo: InvoiceItemRepository, invoiceService: InvoiceService) {
    this._repo = repo;
    this._invoiceService = invoiceService;
  }

  convertToJson(data: IDataValues<IInvoiceItem>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createInvoiceItem(body: IInvoiceItemCreationBody, transaction?: Transaction) {
    const t = transaction || await sequelize.startUnmanagedTransaction();
    
    try {
      // Create the invoice item
      const record = await this._repo.create(body, { t: transaction });
      if (!record) throw new InternalServerError('Create invoice item failed');
      
      // If we started the transaction here, commit it
      if (!transaction) await t.commit();
      
      return this.convertToJson(record) as IInvoiceItem;
    } catch (error) {
      // If we started the transaction here, roll it back
      if (!transaction) await t.rollback();
      throw error;
    }
  }

  async updateInvoiceItem(id: string, body: IInvoiceItemUpdateBody) {
    return await sequelize.transaction(async (t) => {
      // Get the invoice item to find its invoice ID
      const item = await this._repo.findById(id, { t });
      if (!item) throw new InternalServerError('Invoice item not found');
      
      // Update the item
      const record = await this._repo.update({ id }, body, { t });
      if (!record) throw new InternalServerError('Update invoice item failed');
      
      // Update the invoice total
      await this._updateInvoiceTotal(item.invoiceId, t);
      
      return record as IDataValues<IInvoiceItem>;
    }).then(record => this.convertToJson(record) as IInvoiceItem);
  }

  async deleteInvoiceItem(id: string) {
    return await sequelize.transaction(async (t) => {
      // Get the invoice item to find its invoice ID
      const item = await this._repo.findById(id, { t });
      if (!item) throw new InternalServerError('Invoice item not found');
      
      // Delete the item
      await this._repo.delete({ id }, { t });
      
      // Update the invoice total
      await this._updateInvoiceTotal(item.invoiceId, t);
      
      return { success: true };
    });
  }

  async findInvoiceItems(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [
        { model: Product }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInvoiceItem>)!);
  }

  async findInvoiceItemById(id: string) {
    const record = await this._repo.findById(id);
    return record ? this.convertToJson(record as IDataValues<IInvoiceItem>) : null;
  }

  async findInvoiceItemsByInvoiceId(invoiceId: string) {
    const records = await this._repo.find({ invoiceId }, {
      include: [
        { model: Product }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInvoiceItem>)!);
  }

  // Helper method to recalculate and update invoice totals
  private async _updateInvoiceTotal(invoiceId: string, t: Transaction) {
    // Get all items for this invoice
    const items = await this._repo.find({ invoiceId }, { t });
    
    // Calculate the total
    let totalAmount = 0;
    for (const item of items) {
      const itemTotal = item.quantity * Number(item.unitPrice) * (1 - (Number(item.discountPercent) / 100));
      totalAmount += itemTotal;
    }
    
    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;
    
    // Get the current invoice
    const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
    if (!invoice) throw new InternalServerError('Invoice not found');
    
    // Update the invoice
    const paidAmount = Number(invoice.paidAmount);
    const dueAmount = totalAmount - paidAmount;
    
    await invoice.update({
      totalAmount,
      dueAmount
    }, { transaction: t });
  }

  async createInvoiceItemInBulk(body: IInvoiceItemCreationBody[], transaction?: Transaction){
    const t = transaction || await sequelize.startUnmanagedTransaction();
    try{
      const records = await this._repo.bulkCreate(body);
      await t.commit();
      return records;
    }catch(err){
      await t.rollback();
      return err;
    }
  }
}
