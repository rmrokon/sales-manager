import { z } from 'zod';
import { ProductBodyValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Product from './model';

export interface IProduct extends Attributes<Product>{};
export type ICreateProduct = CreationAttributes<Product>;

export type IProductRequestBody = z.infer<typeof ProductBodyValidationSchema>;
