import { z } from 'zod';
import { DiscountCreationValidationSchema, DiscountUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Discount from './model';

export interface IDiscount extends Attributes<Discount>{};
export type ICreateDiscount = CreationAttributes<Discount>;

export type IDiscountCreationBody = z.infer<typeof DiscountCreationValidationSchema>;
export type IDiscountUpdateBody = z.infer<typeof DiscountUpdateValidationSchema>;