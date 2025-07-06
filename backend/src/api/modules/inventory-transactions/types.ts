import { z } from 'zod';
import { InventoryTransactionCreationValidationSchema, InventoryTransactionUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import InventoryTransaction, { TransactionType } from './model';

export interface IInventoryTransaction extends Attributes<InventoryTransaction>{};
export type ICreateInventoryTransaction = CreationAttributes<InventoryTransaction>;

export type IInventoryTransactionCreationBody = z.infer<typeof InventoryTransactionCreationValidationSchema>;
export type IInventoryTransactionUpdateBody = z.infer<typeof InventoryTransactionUpdateValidationSchema>;

export { TransactionType };
