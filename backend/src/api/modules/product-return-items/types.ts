import { z } from 'zod';
import { ProductReturnItemCreationValidationSchema, ProductReturnItemUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import ProductReturnItem from './model';

export interface IProductReturnItem extends Attributes<ProductReturnItem>{};
export type ICreateProductReturnItem = CreationAttributes<ProductReturnItem>;

export type IProductReturnItemCreationBody = z.infer<typeof ProductReturnItemCreationValidationSchema>;
export type IProductReturnItemUpdateBody = z.infer<typeof ProductReturnItemUpdateValidationSchema>;
