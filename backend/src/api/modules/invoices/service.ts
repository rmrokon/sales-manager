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
import { invoiceItemService, billService, inventoryService, inventoryTransactionService, paymentService } from '../bootstrap';
import { includes } from 'lodash';
import InvoiceItem from '../invoice-items/model';
import Product from '../products/model';
import Bill from '../bills/model';
import { InvoiceType } from './types';
import { TransactionType } from '../inventory-transactions/types';
import { IProduct } from '../products/types';

export interface IInvoiceService {
  findInvoices(query: Record<string, unknown>): Promise<IInvoice[]>;
  findInvoicesWithPagination(query: Record<string, unknown>): Promise<any>;
  updateInvoice(id: string, body: IInvoiceUpdateBody): Promise<IInvoice>;
  deleteInvoice(id: string): Promise<{ success: boolean }>;
  createInvoice(body: IInvoiceCreationBody): Promise<IInvoice>;
  findInvoiceById(id: string): Promise<IInvoice | null>;
  recordPayment(invoiceId: string, amount: number): Promise<IInvoice>;
  findInvoiceWithItems(id: string): Promise<IInvoice | null>;
  findInvoiceWithBills(id: string): Promise<IInvoice | null>;
  calculateEffectiveBalance(invoiceId: string): Promise<{
    originalAmount: number;
    totalPayments: number;
    totalReturns: number;
    effectiveBalance: number;
    effectivePaidAmount: number;
    effectiveDueAmount: number;
  }>;
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

  /**
   * Get the appropriate price for a product based on invoice type
   * @param product - The product object
   * @param invoiceType - The type of invoice (PROVIDER, ZONE, COMPANY)
   * @returns The appropriate price to use
   */
  private getProductPriceForInvoiceType(product: IProduct, invoiceType: InvoiceType): number {
    switch (invoiceType) {
      case InvoiceType.PROVIDER:
        // For provider invoices (purchasing), use purchase price
        return product.purchasePrice || product.price || 0;
      case InvoiceType.ZONE:
      case InvoiceType.COMPANY:
        // For zone/company invoices (selling), use selling price
        return product.sellingPrice || product.price || 0;
      default:
        // Fallback to legacy price or 0
        return product.price || 0;
    }
  }

  /**
   * Validate and adjust invoice item prices based on invoice type
   * @param items - Array of invoice items
   * @param invoiceType - The type of invoice
   * @param t - Database transaction
   */
  private async validateAndAdjustItemPrices(items: any[], invoiceType: InvoiceType, t: Transaction) {
    const adjustedItems = [];

    for (const item of items) {
      // Fetch the product to get current pricing
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        throw new InternalServerError(`Product with ID ${item.productId} not found`);
      }

      const expectedPrice = this.getProductPriceForInvoiceType(product, invoiceType);

      // Use the expected price if no unit price is provided, or validate if provided
      const adjustedItem = {
        ...item,
        unitPrice: item.unitPrice || expectedPrice
      };

      // Optional: Add validation to ensure the provided price matches expected price
      // This can be enabled if strict price validation is required
      // if (item.unitPrice && Math.abs(item.unitPrice - expectedPrice) > 0.01) {
      //   throw new InternalServerError(
      //     `Invalid price for product ${product.name}. Expected: ${expectedPrice}, Provided: ${item.unitPrice}`
      //   );
      // }

      adjustedItems.push(adjustedItem);
    }

    return adjustedItems;
  }

  async createInvoice(body: IInvoiceCreationBody) {
    const t = await sequelize.startUnmanagedTransaction();
    const { items, bills, ...invoiceData } = body;
    try{
         // Create the invoice
      const invoice = await this._repo.create(invoiceData, { t });
      if (!invoice) throw new InternalServerError('Create invoice failed');

      // If there are items, validate and adjust prices, then create them and handle inventory
      if(items?.length){
        // Validate and adjust item prices based on invoice type
        const adjustedItems = await this.validateAndAdjustItemPrices(items, invoice.type, t);

        const payload = adjustedItems.map(item => ({...item, invoiceId: invoice.id}));
        await invoiceItemService.createInvoiceItemInBulk(payload, t);

        // Handle inventory based on invoice type
        if (invoice.type === InvoiceType.PROVIDER) {
          // Provider invoice: Add products to inventory
          console.log({invoice})
          await this.handleProviderInvoiceInventory(invoice, adjustedItems, t);
        } else if (invoice.type === InvoiceType.ZONE) {
          // Zone invoice: Deduct products from inventory
          await this.handleZoneInvoiceInventory(invoice, adjustedItems, t);
        }
      }

      // If there are bills, create them
      if(bills?.length){
        const billPayload = bills.map(bill => ({...bill, invoiceId: invoice.id}));
        await billService.createBillInBulk(billPayload, t);
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
    order: [['createdAt', 'DESC']],
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
      await paymentService.createPayment({
        invoiceId,
        amount,
        paymentDate: new Date(),
        paymentMethod: 'manual', // Default method
        remarks: 'Payment recorded via API'
      }, { t });
      
      return this.convertToJson(updatedInvoice as IDataValues<IInvoice>) as IInvoice;
    });
  }

  async findInvoiceWithItems(id: string) {
    const invoice = await this._repo.find({id}, {
      include: [
        { model: Provider, as:'ReceiverProvider' },
        { model: Zone, as: 'ReceiverZone' },
        {model: InvoiceItem, include: [{ model: Product }]},
        {model: Bill}
      ]
    });
    if (!invoice || invoice.length === 0) return null;

    return this.convertToJson(invoice[0] as IDataValues<IInvoice>) as IInvoice;
  }

  async findInvoiceWithBills(id: string) {
    const invoice = await this._repo.find({id}, {
      include: [
        { model: Provider, as: 'ReceiverProvider' },
        { model: Zone, as: 'ReceiverZone' },
        {model: Bill}
      ]
    });
    if (!invoice || invoice.length === 0) return null;

    return this.convertToJson(invoice[0] as IDataValues<IInvoice>) as IInvoice;
  }

  private async handleProviderInvoiceInventory(invoice: any, items: any[], t: any) {
    // For provider invoices, add products to inventory
    console.log(invoice);
    const inventoryTransactions = [];

    for (const item of items) {
      // Add to inventory using upsert (create or update)
      await inventoryService.upsertInventory(
        {
          productId: item.productId,
          providerId: invoice.toProviderId,
          companyId: invoice.company_id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,},
          { t }
      );

      // Create inventory transaction record
      inventoryTransactions.push({
        productId: item.productId,
        transactionType: TransactionType.PURCHASE,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        relatedInvoiceId: invoice.id,
        providerId: invoice.receiverProviderId,
        remarks: `Purchase from provider invoice ${invoice.id}`
      });
    }

    // Create all inventory transactions
    if (inventoryTransactions.length > 0) {
      await inventoryTransactionService.createTransactionInBulk(inventoryTransactions, t);
    }
  }

  private async handleZoneInvoiceInventory(invoice: any, items: any[], t: any) {
    // For zone invoices, deduct products from inventory
    const inventoryTransactions = [];

    for (const item of items) {
      // Check inventory availability first
      const availability = await inventoryService.checkInventoryAvailability(
        item.productId,
        item.quantity
      );

      if (!availability.available) {
        throw new Error(
          `Insufficient inventory for product ${item.productId}. Available: ${availability.currentQuantity}, Required: ${item.quantity}`
        );
      }

      // Find the inventory record to deduct from (we'll use the first available provider)
      const inventoryRecords = await inventoryService.findInventoryByProduct(item.productId);
      if (inventoryRecords.length === 0) {
        throw new InternalServerError(`No inventory found for product ${item.productId}`);
      }

      // Deduct from inventory (negative quantity)
      await inventoryService.updateInventoryQuantity(
        item.productId,
        inventoryRecords[0].providerId,
        -item.quantity,
        { t }
      );

      // Create inventory transaction record
      inventoryTransactions.push({
        productId: item.productId,
        transactionType: TransactionType.DISTRIBUTION,
        quantity: -item.quantity, // Negative for distribution
        unitPrice: item.unitPrice,
        relatedInvoiceId: invoice.id,
        zoneId: invoice.receiverZoneId,
        providerId: inventoryRecords[0].providerId,
        remarks: `Distribution to zone invoice ${invoice.id}`
      });
    }

    // Create all inventory transactions
    if (inventoryTransactions.length > 0) {
      await inventoryTransactionService.createTransactionInBulk(inventoryTransactions, t);
    }
  }

  async calculateEffectiveBalance(invoiceId: string) {
    // Get the original invoice
    const invoice = await this._repo.findById(invoiceId);
    if (!invoice) {
      throw new InternalServerError('Invoice not found');
    }

    // Get all payments for this invoice
    const payments = await Payment.findAll({
      where: { invoiceId },
      attributes: ['amount']
    });
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get all returns for this invoice
    const { productReturnService } = require('../bootstrap');
    const returns = await productReturnService.findReturnsByInvoice(invoiceId);
    const totalReturns = returns
      .filter((ret: any) => ret.status === 'approved')
      .reduce((sum: number, ret: any) => sum + ret.totalReturnAmount, 0);

    const originalAmount = invoice.totalAmount;
    const effectiveBalance = originalAmount - totalReturns;
    const effectivePaidAmount = Math.min(totalPayments, effectiveBalance);
    const effectiveDueAmount = Math.max(0, effectiveBalance - totalPayments);

    return {
      originalAmount,
      totalPayments,
      totalReturns,
      effectiveBalance,
      effectivePaidAmount,
      effectiveDueAmount
    };
  }
}
