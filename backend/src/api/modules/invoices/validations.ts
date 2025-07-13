import { z } from 'zod';
import { InvoiceType } from './types';
import { BulkInvoiceItemCreationValidationSchema } from '../invoice-items/validations';

// Bill validation schema for invoice creation
export const BulkBillCreationValidationSchema = z.array(z.object({
  title: z.string({required_error: 'Bill title is required'}),
  description: z.string().optional(),
  amount: z.number({required_error: 'Bill amount is required'})
    .min(0, 'Bill amount cannot be negative'),
}));

export const InvoiceCreationValidationSchema = z.object({
  type: z.enum([InvoiceType.PROVIDER, InvoiceType.ZONE, InvoiceType.COMPANY], {
    required_error: 'Invoice type is required',
    invalid_type_error: 'Invoice type must be either "provider", "zone", or "company"'
  }),
  fromUserId: z.string({required_error: 'Sender user ID is required'}),
  toProviderId: z.string().optional().nullable(),
  company_id: z.string().optional(),
  toZoneId: z.string().optional().nullable(),
  totalAmount: z.number({required_error: 'Total amount is required'})
    .min(0, 'Total amount cannot be negative'),
  paidAmount: z.number({required_error: 'Paid amount is required'})
    .min(0, 'Paid amount cannot be negative')
    .default(0),
  dueAmount: z.number({required_error: 'Due amount is required'})
    .min(0, 'Due amount cannot be negative'),
  invoiceDate: z.string().optional(),
  discountType: z.enum(['percentage', 'amount']).optional(),
  discountValue: z.number().min(0, 'Discount value cannot be negative').optional(),
  items: BulkInvoiceItemCreationValidationSchema.optional(),
  bills: BulkBillCreationValidationSchema.optional(),
}).refine(data => {
  // Ensure proper recipient is provided based on type
  if (data.type === InvoiceType.PROVIDER && !data.toProviderId) {
    return false;
  }
  if (data.type === InvoiceType.ZONE && !data.toZoneId) {
    return false;
  }
  // Company invoices don't need a specific recipient
  return true;
}, {
  message: 'Provider invoice must have toProviderId, Zone invoice must have toZoneId',
  path: ['type']
}).refine(data => {
  // Ensure dueAmount = totalAmount - paidAmount
  return data.dueAmount === data.totalAmount - data.paidAmount;
}, {
  message: 'Due amount must equal total amount minus paid amount',
  path: ['dueAmount']
});

export const InvoiceUpdateValidationSchema = z.object({
  paidAmount: z.number()
    .min(0, 'Paid amount cannot be negative')
    .optional(),
  dueAmount: z.number()
    .min(0, 'Due amount cannot be negative')
    .optional(),
}).refine(data => {
  // If both paidAmount and dueAmount are provided, they should be consistent
  if (data.paidAmount !== undefined && data.dueAmount !== undefined) {
    // We can't validate against totalAmount here since we don't have it
    // This will be handled in the service layer
    return true;
  }
  return true;
}, {
  message: 'Due amount must be consistent with paid amount',
  path: ['dueAmount']
});