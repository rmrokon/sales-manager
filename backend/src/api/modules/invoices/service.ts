import { Op, Transaction } from '@sequelize/core';
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
import Product from '../products/model';

export interface IInvoiceService {
  findInvoices(query: Record<string, unknown>): Promise<IInvoice[]>;
  findInvoicesWithPagination(query: Record<string, unknown>): Promise<any>;
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
    const t = await sequelize.startUnmanagedTransaction();
    const { items, ...invoiceData } = body;
    try{
         // Create the invoice
      const invoice = await this._repo.create(invoiceData, { t });
      if (!invoice) throw new InternalServerError('Create invoice failed');
      
      // If there are items, create them
      if(items?.length){
        const payload = items.map(item => ({...item, invoiceId: invoice.id}));
        await invoiceItemService.createInvoiceItemInBulk(payload, t);
      }
      
      await t.commit();
      return this.convertToJson(invoice) as IInvoice;
      }catch(err){
        console.log(err);
        await t.rollback();
        throw err;
      }
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

  async findInvoicesWithPagination2(query: Record<string, unknown>, options?: { t: Transaction }) {
    // Extract filter parameters
    const { search, dateFrom, dateTo, date, type, page, limit, company_id, ...otherQuery } = query;

    // Build base where conditions
    const baseConditions: any = { ...otherQuery };

    // Add type filter to base conditions
    if (type) {
      baseConditions.type = type;
    }

    // Build final where conditions
    let whereConditions: any = baseConditions;

    // Add search conditions
    if (search) {
      const searchConditions = {
        [Op.or]: [
          { id: { [Op.iLike]: `%${search}%` } },
          { type: { [Op.iLike]: `%${search}%` } }
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

    const result = await this._repo.findWithPagination(whereConditions, {
      ...options,
      include: [
        { model: Provider, as: 'ReceiverProvider' },
        { model: Zone, as: 'ReceiverZone' }
      ]
    });

    return {
      ...result,
      nodes: result.nodes.map((record) => this.convertToJson(record as IDataValues<IInvoice>)!)
    };
  } // Adjust imports as needed

async findInvoicesWithPagination(
  query: Record<string, unknown>,
  options?: { t?: Transaction }
) {
  const {
    search,
    dateFrom,
    dateTo,
    date,
    type,
    page = '1',
    limit = '10',
    ...restQuery
  } = query;

  // Convert pagination values to numbers
  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const offset = (pageNumber - 1) * limitNumber;

  // Build base filter conditions
  const baseConditions: any = {};

  if (type) {
    baseConditions.type = type;
  }

  // Include any other filters (except pagination)
  for (const [key, value] of Object.entries(restQuery)) {
    if (value !== undefined && key !== 'page' && key !== 'limit') {
      baseConditions[key] = value;
    }
  }

  // Handle search
  // let whereConditions: any = baseConditions;
  // if (search) {
  //   const searchConditions = {
  //     [Op.or]: [
  //       { id: { [Op.iLike]: `%${search}%` } },
  //       { type: { [Op.iLike]: `%${search}%` } }
  //     ]
  //   };

  //   whereConditions = Object.keys(baseConditions).length > 0
  //     ? { [Op.and]: [baseConditions, searchConditions] }
  //     : searchConditions;
  // }

  let whereConditions: any = { ...baseConditions };

if (search) {
  const orConditions = [
    { id: { [Op.iLike]: `%${search}%` } },
    { type: { [Op.iLike]: `%${search}%` } }
  ];

  // Combine baseConditions and search safely
  if (Object.keys(baseConditions).length > 0) {
    whereConditions = {
      [Op.and]: [
        { ...baseConditions },
        { [Op.or]: orConditions }
      ]
    };
  } else {
    whereConditions = {
      [Op.or]: orConditions
    };
  }
}

// if (search) {
//       whereConditions[Op.or] = [
//         {
//           title: {
//             [Op.iLike]: `%${search}%`,
//           },
//         },
//         {
//           type: {
//             [Op.iLike]: `%${search}%`,
//           },
//         },
//         {
//           ReceiverZone: {
//             name: {
//             [Op.iLike]: `%${search}%`,
//           },
//           }
//         },
//       ];
//     }

  // Handle date filters
  if (date) {
    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    whereConditions.createdAt = { [Op.between]: [startOfDay, endOfDay] };
  } else if (dateFrom || dateTo) {
    const dateFilter: any = {};
    if (dateFrom) {
      const from = new Date(dateFrom as string);
      from.setHours(0, 0, 0, 0);
      dateFilter[Op.gte] = from;
    }
    if (dateTo) {
      const to = new Date(dateTo as string);
      to.setHours(23, 59, 59, 999);
      dateFilter[Op.lte] = to;
    }

    whereConditions.createdAt = dateFilter;
  }
  console.log({whereConditions});

  // Fetch paginated result
  const result = await this._repo.findWithPagination(whereConditions, {
    ...options,
    offset,
    limit: limitNumber,
    include: [
      { model: Provider, as: 'ReceiverProvider' },
      { model: Zone, as: 'ReceiverZone' }
    ]
  });

  return {
    ...result,
    nodes: result.nodes.map(record =>
      this.convertToJson(record as IDataValues<IInvoice>)!
    )
  };
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
        {model: InvoiceItem, include: [{ model: Product }]}
      ]
    });
    if (!invoice) return null;
    
    return invoice[0];
  }
}
