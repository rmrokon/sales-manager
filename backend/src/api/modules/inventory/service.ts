import { Op, Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInventoryCreationBody, IInventoryUpdateBody, IInventory, IInventoryStats, ILowStockItem } from './types';
import { sequelize } from '../../../configs';
import InventoryRepository from './repository';
import Product from '../products/model';
import Provider from '../providers/model';

export interface IInventoryService {
  findInventory(query: Record<string, unknown>): Promise<IInventory[]>;
  updateInventory(id: string, body: IInventoryUpdateBody & { companyId: string }): Promise<IInventory>;
  deleteInventory(id: string): Promise<{ success: boolean }>;
  createInventory(body: IInventoryCreationBody): Promise<IInventory>;
  findInventoryById(id: string): Promise<IInventory | null>;
  findInventoryByProduct(productId: string): Promise<IInventory[]>;
  updateInventoryQuantity(productId: string, providerId: string, quantityChange: number, options?: { t?: Transaction }): Promise<IInventory>;
  upsertInventory({ productId, providerId, quantity, unitPrice, companyId }: { productId: string, providerId: string, quantity: number, unitPrice: number, companyId: string }, options?: { t?: Transaction }): Promise<IInventory>;
  checkInventoryAvailability(productId: string, requiredQuantity: number): Promise<{ available: boolean; currentQuantity: number }>;
  getInventoryStats(companyId: string): Promise<IInventoryStats>;
  getLowStockItems(companyId: string, threshold?: number): Promise<ILowStockItem[]>;
}

export default class InventoryService implements IInventoryService {
  _repo: InventoryRepository;

  constructor(repo: InventoryRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IInventory>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createInventory(body: IInventoryCreationBody) {
    const record = await sequelize.transaction(async (t) => {
      const record = await this._repo.create(body, { t });
      if (!record) throw new InternalServerError('Create inventory failed');
      return record as IDataValues<IInventory>;
    });
    return this.convertToJson(record) as IInventory;
  }

  async updateInventory(id: string, body: IInventoryUpdateBody & { companyId: string }) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update inventory failed');
    return this.convertToJson(record as IDataValues<IInventory>) as IInventory;
  }

  async deleteInventory(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findInventory(query: Record<string, unknown>, options?: { t: Transaction }) {
    const { search, ...rest } = query;
    const records = await this._repo.find(rest, {
      ...options,
      include: [
        { model: Product },
        { model: Provider }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventory>)!);
  }

  async findInventoryById(id: string) {
    const record = await this._repo.findById(id);
    return record ? this.convertToJson(record as IDataValues<IInventory>) : null;
  }

  async findInventoryByProduct(productId: string) {
    const records = await this._repo.find({ productId }, {
      include: [
        { model: Product },
        { model: Provider }
      ]
    });
    return records.map((record) => this.convertToJson(record as IDataValues<IInventory>)!);
  }

  async updateInventoryQuantity(productId: string, providerId: string, quantityChange: number, options?: { t?: Transaction }) {
    // Find existing inventory record
    const existingInventory = await this._repo.find({ productId, providerId }, options);

    if (existingInventory.length > 0) {
      // Update existing record
      const current = existingInventory[0];
      const newQuantity = current.quantity + quantityChange;

      if (newQuantity < 0) {
        throw new InternalServerError(`Insufficient inventory. Available: ${current.quantity}, Required: ${Math.abs(quantityChange)}`);
      }

      const updated = await this._repo.update(
        { id: current.id },
        { quantity: newQuantity },
        options
      );

      if (!updated) throw new InternalServerError('Failed to update inventory quantity');
      return this.convertToJson(updated as IDataValues<IInventory>) as IInventory;
    } else {
      throw new InternalServerError('Inventory record not found for this product and provider');
    }
  }

  async upsertInventory({
    productId,
    providerId,
    quantity,
    unitPrice,
    companyId
  }: {
    productId: string,
    providerId: string,
    quantity: number,
    unitPrice: number,
    companyId: string;
  }, options?: { t?: Transaction }) {
    // Check if inventory record exists
    const existingInventory = await this._repo.find({ productId, providerId, companyId }, options);

    if (existingInventory.length > 0) {
      // Update existing record - add to quantity
      const current = existingInventory[0];
      const newQuantity = current.quantity + quantity;

      const updated = await this._repo.update(
        { id: current.id },
        { quantity: newQuantity, unitPrice }, // Update price to latest
        options
      );

      if (!updated) throw new InternalServerError('Failed to update inventory');
      return this.convertToJson(updated as IDataValues<IInventory>) as IInventory;
    } else {
      // Create new record
      const created = await this._repo.create({
        productId,
        providerId,
        companyId,
        quantity,
        unitPrice
      }, options);

      if (!created) throw new InternalServerError('Failed to create inventory record');
      return this.convertToJson(created as IDataValues<IInventory>) as IInventory;
    }
  }

  async checkInventoryAvailability(productId: string, requiredQuantity: number) {
    const inventoryRecords = await this._repo.find({ productId });
    const totalQuantity = inventoryRecords.reduce((sum, record) => sum + record.quantity, 0);

    return {
      available: totalQuantity >= requiredQuantity,
      currentQuantity: totalQuantity
    };
  }

  async getInventoryStats(companyId: string): Promise<IInventoryStats> {
    // Get all inventory records with product and provider info
    const inventoryRecords = await this._repo.find({
      companyId
    }, {
      include: [
        { model: Product },
        { model: Provider }
      ]
    });

    // Calculate total products (unique products)
    const uniqueProducts = new Set(inventoryRecords.map(record => record.productId));
    const totalProducts = uniqueProducts.size;

    // Calculate total value
    const totalValue = inventoryRecords.reduce((sum, record) => {
      return sum + (record.quantity * record.unitPrice);
    }, 0);

    // Calculate low stock items (items with quantity <= 10)
    const lowStockThreshold = 10;
    const lowStockItems = inventoryRecords.filter(record => record.quantity <= lowStockThreshold).length;

    // For now, we'll set recent transactions to 0
    // This can be improved later by adding a method that doesn't create circular dependencies
    const recentTransactions = 0;


    return {
      totalProducts,
      totalValue,
      lowStockItems,
      recentTransactions
    };
  }

  async getLowStockItems(companyId: string, threshold: number = 10): Promise<ILowStockItem[]> {
    // Get all inventory records with low stock
    const lowStockRecords = await this._repo.find({
      companyId,
    }, {
      where: {
        quantity: {
          [Op.lte]: threshold
        }
      },
      include: [
        { model: Product },
        { model: Provider }
      ]
    });

    // Group by product
    const productGroups = new Map<string, any[]>();
    lowStockRecords.forEach(record => {
      const productId = record.productId;
      if (!productGroups.has(productId)) {
        productGroups.set(productId, []);
      }
      productGroups.get(productId)!.push(record);
    });

    // Convert to LowStockItem format
    const lowStockItems: ILowStockItem[] = [];
    productGroups.forEach((records, productId) => {
      const firstRecord = records[0];
      const product = (firstRecord as any).product;

      // Calculate total current stock for this product across all providers
      const currentStock = records.reduce((sum, record) => sum + record.quantity, 0);

      // For now, we'll use the threshold as minimum stock
      // In a real application, this might be stored per product
      const minimumStock = threshold;

      const providers = records.map(record => {
        const provider = (record as any).provider;
        return {
          providerId: record.providerId,
          providerName: provider?.name || 'Unknown Provider',
          quantity: record.quantity,
          unitPrice: record.unitPrice
        };
      });

      lowStockItems.push({
        productId,
        productName: product?.name || 'Unknown Product',
        currentStock,
        minimumStock,
        providers
      });
    });

    return lowStockItems;
  }
}