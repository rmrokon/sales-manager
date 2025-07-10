import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IProductReturn, IProductReturnCreationBody, IProductReturnUpdateBody, ReturnStatus } from './types';
import { sequelize } from '../../../configs';
import ProductReturnRepository from './repository';
import ProductReturnItemRepository from '../product-return-items/repository';
import Invoice from '../invoices/model';
import Zone from '../zones/model';
import ProductReturnItem from '../product-return-items/model';
import Product from '../products/model';
import { inventoryService, inventoryTransactionService, invoiceService, paymentService, productReturnItemService } from '../bootstrap';
import { TransactionType } from '../inventory-transactions/types';
import Payment from '../payments/model';

export interface IProductReturnService {
  findReturns(query: Record<string, unknown>): Promise<IProductReturn[]>;
  createReturn(body: IProductReturnCreationBody): Promise<IProductReturn>;
  updateReturn(id: string, body: IProductReturnUpdateBody): Promise<IProductReturn>;
  approveReturn(id: string): Promise<IProductReturn>;
  rejectReturn(id: string): Promise<IProductReturn>;
  findReturnById(id: string): Promise<IProductReturn | null>;
  findReturnsByInvoice(invoiceId: string): Promise<IProductReturn[]>;
  findReturnsByZone(zoneId: string): Promise<IProductReturn[]>;
}

export default class ProductReturnService implements IProductReturnService {
  _repo: ProductReturnRepository;
  _returnItemRepo: ProductReturnItemRepository;

  constructor(repo: ProductReturnRepository, returnItemRepo: ProductReturnItemRepository) {
    this._repo = repo;
    this._returnItemRepo = returnItemRepo;
  }

  convertToJson(data: IDataValues<IProductReturn>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createReturn(body: IProductReturnCreationBody) {
    return await sequelize.transaction(async (t) => {
      const { returnItems, paymentAmount, ...returnData } = body;

      // Validate the original invoice exists and is a zone invoice
      const originalInvoice = await invoiceService.findInvoiceById(body.originalInvoiceId);
      if (!originalInvoice) {
        throw new InternalServerError('Original invoice not found');
      }
      if (originalInvoice.type !== 'zone') {
        throw new InternalServerError('Can only create returns for zone invoices');
      }

      // Create the return record
      const productReturn = await this._repo.create({...returnData, status: ReturnStatus.PENDING}, { t });
      if (!productReturn) throw new InternalServerError('Create product return failed');

      // Create return items
      const returnItemsWithReturnId = returnItems.map(item => ({
        ...item,
        returnId: productReturn.id
      }));
      
      await productReturnItemService.createReturnItemInBulk(returnItemsWithReturnId, t);

      // If there's a payment amount, create a payment record
      if (paymentAmount && paymentAmount > 0) {
        await paymentService.createPayment({
          invoiceId: body.originalInvoiceId,
          amount: paymentAmount,
          paymentDate: new Date(),
          paymentMethod: 'return_payment',
          remarks: `Payment with return ${productReturn.id}`
        }, { t });
      }

      return this.convertToJson(productReturn as IDataValues<IProductReturn>) as IProductReturn;
    });
  }

  async approveReturn(id: string) {
    return await sequelize.transaction(async (t) => {
      // Get the return with its items
      const productReturn = await this._repo.find({ id }, {
        t,
        include: [
          { 
            model: ProductReturnItem, 
            as: 'ReturnItems',
            include: [{ model: Product }]
          },
          { model: Invoice, as: 'OriginalInvoice' }
        ]
      });

      if (!productReturn || productReturn.length === 0) {
        throw new InternalServerError('Product return not found');
      }

      const returnRecord = productReturn[0] as any;
      
      if (returnRecord.status !== ReturnStatus.PENDING) {
        throw new InternalServerError('Only pending returns can be approved');
      }

      // Update return status
      const updatedReturn = await this._repo.update({ id }, { status: ReturnStatus.APPROVED }, { t });
      if (!updatedReturn) throw new InternalServerError('Failed to approve return');

      // Add returned products back to inventory and create transactions
      const inventoryTransactions = [];
      
      for (const returnItem of returnRecord.ReturnItems) {
        // Find the original provider for this product from the invoice
        const originalInvoice = returnRecord.OriginalInvoice;
        
        // Add back to inventory (we'll need to determine which provider to add it back to)
        // For now, we'll add it back to the first provider that has this product
        const existingInventory = await inventoryService.findInventoryByProduct(returnItem.productId);
        let providerId: string | undefined = undefined;
        
        if (existingInventory && existingInventory.length > 0) {
          providerId = existingInventory[0].providerId;
          // Update existing inventory
          await inventoryService.updateInventoryQuantity(
            returnItem.productId, 
            providerId, 
            returnItem.returnedQuantity,
            { t }
          );
        }

        // Create inventory transaction record
        inventoryTransactions.push({
          productId: returnItem.productId,
          transactionType: TransactionType.RETURN,
          quantity: returnItem.returnedQuantity,
          unitPrice: returnItem.unitPrice,
          relatedReturnId: id,
          relatedInvoiceId: returnRecord.originalInvoiceId,
          zoneId: returnRecord.zoneId,
          providerId: providerId,
          remarks: `Return approved for return ${id}`
        });
      }

      // Create all inventory transactions
      if (inventoryTransactions.length > 0) {
        await inventoryTransactionService.createTransactionInBulk(inventoryTransactions, t);
      }

      return this.convertToJson(updatedReturn as IDataValues<IProductReturn>) as IProductReturn;
    });
  }

  async rejectReturn(id: string) {
    const updatedReturn = await this._repo.update({ id }, { status: ReturnStatus.REJECTED });
    if (!updatedReturn) throw new InternalServerError('Failed to reject return');
    return this.convertToJson(updatedReturn as IDataValues<IProductReturn>) as IProductReturn;
  }

  async updateReturn(id: string, body: IProductReturnUpdateBody) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update product return failed');
    return this.convertToJson(record as IDataValues<IProductReturn>) as IProductReturn;
  }

  async findReturns(query: Record<string, unknown>, options?: { t?: Transaction }) {
    const records = await this._repo.find(query, {
      ...options,
      include: [
        { model: Invoice, as: 'OriginalInvoice' },
        { model: Zone },
        { 
          model: ProductReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product }]
        }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturn>)!);
  }

  async findReturnById(id: string) {
    const records = await this._repo.find({ id }, {
      include: [
        { model: Invoice, as: 'OriginalInvoice' },
        { model: Zone },
        { 
          model: ProductReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product }]
        }
      ]
    });
    return records.length > 0 ? this.convertToJson(records[0] as IDataValues<IProductReturn>) : null;
  }

  async findReturnsByInvoice(invoiceId: string) {
    const records = await this._repo.find({
      originalInvoiceId: invoiceId
    }, {
      include: [
        { model: Invoice, as: 'OriginalInvoice' },
        { model: Zone },
        { 
          model: ProductReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product }]
        }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturn>)!);
  }

  async findReturnsByZone(zoneId: string) {
    const records = await this._repo.find({zoneId}, {
      include: [
        { model: Invoice, as: 'OriginalInvoice' },
        { model: Zone },
        { 
          model: ProductReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product }]
        }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IProductReturn>)!);
  }
}
