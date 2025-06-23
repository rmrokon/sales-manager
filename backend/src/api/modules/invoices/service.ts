import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInvoice, IInvoiceCreationBody, IInvoiceUpdateBody } from './types';
import { sequelize } from '../../../configs';
import InvoiceRepository from './repository';
import User from '../users/model';
import Company from '../companies/model';
import Zone from '../zones/model';
import Payment from '../payments/model';
import Provider from '../providers/model';
import { invoiceItemService } from '../bootstrap';
import { includes } from 'lodash';
import InvoiceItem from '../invoice-items/model';

export interface IInvoiceService {
  findInvoices(query: Record<string, unknown>): Promise<IInvoice[]>;
  updateInvoice(id: string, body: IInvoiceUpdateBody): Promise<IInvoice>;
  deleteInvoice(id: string): Promise<{ success: boolean }>;
  createInvoice(body: IInvoiceCreationBody): Promise<IInvoice>;
  findInvoiceById(id: string): Promise<IInvoice | null>;
  recordPayment(invoiceId: string, amount: number): Promise<IInvoice>;
  findInvoiceWithItems(id: string): Promise<IInvoice | null>;
}

export default class InvoiceService implements IInvoiceService {
  _repo: InvoiceRepository;

  constructor(repo: InvoiceRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IInvoice>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createInvoice(body: IInvoiceCreationBody) {
    const { items, ...invoiceData } = body;
    
    const record = await sequelize.transaction(async (t) => {
      try{
         // Create the invoice
      const invoice = await this._repo.create(invoiceData, { t });
      if (!invoice) throw new InternalServerError('Create invoice failed');
      
      // If there are items, create them
      if(items?.length){
        const payload = items.map(item => ({...item, invoiceId: invoice.id}));
        await invoiceItemService.createInvoiceItemInBulk(payload, t);
      }
      
      return invoice as IDataValues<IInvoice>;
      }catch(err){
        await t.rollback();
        throw err;
      }
    });
    
    return this.convertToJson(record) as IInvoice;
  }

  async updateInvoice(id: string, body: IInvoiceUpdateBody) {
    // If updating payment amounts, ensure they're consistent
    if (body.paidAmount !== undefined || body.dueAmount !== undefined) {
      const invoice = await this._repo.findById(id);
      if (!invoice) throw new InternalServerError('Invoice not found');
      
      const currentTotal = invoice.totalAmount;
      const newPaid = body.paidAmount ?? invoice.paidAmount;
      const newDue = body.dueAmount ?? invoice.dueAmount;
      
      // Ensure the new values are consistent
      if (newPaid + newDue !== currentTotal) {
        throw new InternalServerError('Paid amount + due amount must equal total amount');
      }
      
      // Update both values to maintain consistency
      body.paidAmount = newPaid;
      body.dueAmount = newDue;
    }
    
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update invoice failed');
    return this.convertToJson(record as IDataValues<IInvoice>) as IInvoice;
  }

  async deleteInvoice(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findInvoices(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [
        { model: Provider, as: 'ReceiverProvider' },
        { model: Zone, as: 'ReceiverZone' }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInvoice>)!);
  }

  async findInvoiceById(id: string) {
    const record = await this._repo.findById(id);
    return record ? this.convertToJson(record as IDataValues<IInvoice>) : null;
  }

  async recordPayment(invoiceId: string, amount: number) {
    return await sequelize.transaction(async (t) => {
      // Get the current invoice
      const invoice = await this._repo.findById(invoiceId, { t });
      if (!invoice) throw new InternalServerError('Invoice not found');
      
      // Calculate new amounts
      const newPaidAmount = Number(invoice.paidAmount) + amount;
      const newDueAmount = Number(invoice.totalAmount) - newPaidAmount;
      
      if (newPaidAmount > invoice.totalAmount) {
        throw new InternalServerError('Payment amount exceeds the invoice total');
      }
      
      // Update the invoice
      const updatedInvoice = await this._repo.update(
        { id: invoiceId },
        { 
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount
        },
        { t }
      );
      
      if (!updatedInvoice) throw new InternalServerError('Failed to update invoice');
      
      // Create a payment record
      await Payment.create({
        invoiceId,
        amount,
        paymentDate: new Date(),
        paymentMethod: 'manual', // Default method
        remarks: 'Payment recorded via API'
      }, { transaction: t });
      
      return this.convertToJson(updatedInvoice as IDataValues<IInvoice>) as IInvoice;
    });
  }

  async findInvoiceWithItems(id: string) {
    const invoice = await this._repo.find({id}, {
      include: [
        { model: Provider, as: 'ReceiverProvider' },
        { model: Zone, as: 'ReceiverZone' },
        {model: InvoiceItem}
      ]
    });
    if (!invoice) return null;
    
    // Get the invoice items
    // const items = await invoice.getInvoiceItems({
    //   include: [{ model: Product }]
    // });
    
    // const invoiceData = this.convertToJson(invoice as IDataValues<IInvoice>);
    
    return invoice[0];
  }
}
