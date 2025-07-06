import { Transaction } from '@sequelize/core';
import { IDataValues, InternalServerError } from '../../../utils';
import { IInventoryCreationBody, IInventoryUpdateBody, IInventory } from './types';
import { sequelize } from '../../../configs';
import InventoryRepository from './repository';
import Product from '../products/model';
import Provider from '../providers/model';

export interface IInventoryService {
  findInventory(query: Record<string, unknown>): Promise<IInventory[]>;
  updateInventory(id: string, body: IInventoryUpdateBody): Promise<IInventory>;
  deleteInventory(id: string): Promise<{ success: boolean }>;
  createInventory(body: IInventoryCreationBody): Promise<IInventory>;
  findInventoryById(id: string): Promise<IInventory | null>;
  findInventoryByProduct(productId: string): Promise<IInventory[]>;
  updateInventoryQuantity(productId: string, providerId: string, quantityChange: number, options?: { t?: Transaction }): Promise<IInventory>;
  upsertInventory(productId: string, providerId: string, quantity: number, unitPrice: number, options?: { t?: Transaction }): Promise<IInventory>;
  checkInventoryAvailability(productId: string, requiredQuantity: number): Promise<{ available: boolean; currentQuantity: number }>;
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

  async updateInventory(id: string, body: IInventoryUpdateBody) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update inventory failed');
    return this.convertToJson(record as IDataValues<IInventory>) as IInventory;
  }

  async deleteInventory(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findInventory(query: Record<string, unknown>, options?: { t: Transaction }) {
    const records = await this._repo.find(query, {
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

  async upsertInventory(productId: string, providerId: string, quantity: number, unitPrice: number, options?: { t?: Transaction }) {
    // Check if inventory record exists
    const existingInventory = await this._repo.find({ productId, providerId }, options);

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
}