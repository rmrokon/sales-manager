import { z } from 'zod';
import { InvoiceCreationValidationSchema, InvoiceUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Invoice from './model';
import { IInvoiceItem } from '../invoice-items/types';

export interface IInvoice extends Attributes<Invoice>{};
export type ICreateInvoice = CreationAttributes<Invoice>;

// export interface InvoiceItemInput {
//   productId: string;
//   quantity: number;
//   unitPrice: number;
//   discountPercent?: number;
// }

export interface IInvoiceCreationBody extends z.infer<typeof InvoiceCreationValidationSchema> {
  items?: IInvoiceItem[];
}

export type IInvoiceUpdateBody = z.infer<typeof InvoiceUpdateValidationSchema>;

export enum InvoiceType {
  PROVIDER = 'provider',
  ZONE = 'zone',
}
