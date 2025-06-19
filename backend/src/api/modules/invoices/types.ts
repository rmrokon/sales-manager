import { z } from 'zod';
import { InvoiceCreationValidationSchema, InvoiceUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Invoice, { InvoiceType } from './model';

export { InvoiceType };
export interface IInvoice extends Attributes<Invoice>{};
export type ICreateInvoice = CreationAttributes<Invoice>;

export type IInvoiceCreationBody = z.infer<typeof InvoiceCreationValidationSchema>;
export type IInvoiceUpdateBody = z.infer<typeof InvoiceUpdateValidationSchema>;