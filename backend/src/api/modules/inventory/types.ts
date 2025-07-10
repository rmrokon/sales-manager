import { z } from 'zod';
import { InventoryCreationValidationSchema, InventoryUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Inventory from './model';

export interface IInventory extends Attributes<Inventory>{};
export type ICreateInventory = CreationAttributes<Inventory>;

export type IInventoryCreationBody = z.infer<typeof InventoryCreationValidationSchema>;
export type IInventoryUpdateBody = z.infer<typeof InventoryUpdateValidationSchema>;

export interface IInventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  recentTransactions: number;
}

export interface ILowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  providers: Array<{
    providerId: string;
    providerName: string;
    quantity: number;
    unitPrice: number;
  }>;
}