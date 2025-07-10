import { z } from 'zod';
import { ProductReturnCreationValidationSchema, ProductReturnUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import ProductReturn, { ReturnStatus } from './model';
import { IProductReturnItem } from '../product-return-items/types';

export interface IProductReturn extends Attributes<ProductReturn>{};
export type ICreateProductReturn = CreationAttributes<ProductReturn>;

export interface IProductReturnCreationBody extends z.infer<typeof ProductReturnCreationValidationSchema> {
  returnItems: Omit<IProductReturnItem, 'id' | 'returnId' | 'createdAt' | 'updatedAt'>[];
  paymentAmount?: number; // Amount being paid along with the return
}

export type IProductReturnUpdateBody = z.infer<typeof ProductReturnUpdateValidationSchema>;

export { ReturnStatus };
