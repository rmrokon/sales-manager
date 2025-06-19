import { z } from 'zod';
import { InvoiceItemCreationValidationSchema, InvoiceItemUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import InvoiceItem from './model';

export interface IInvoiceItem extends Attributes<InvoiceItem>{};
export type ICreateInvoiceItem = CreationAttributes<InvoiceItem>;

export type IInvoiceItemCreationBody = z.infer<typeof InvoiceItemCreationValidationSchema>;
export type IInvoiceItemUpdateBody = z.infer<typeof InvoiceItemUpdateValidationSchema>;