import { z } from 'zod';
import { BillCreationValidationSchema, BillUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Bill from './model';

export interface IBill extends Attributes<Bill>{};
export type ICreateBill = CreationAttributes<Bill>;

export interface IBillCreationBody extends z.infer<typeof BillCreationValidationSchema> {}

export type IBillUpdateBody = z.infer<typeof BillUpdateValidationSchema>;