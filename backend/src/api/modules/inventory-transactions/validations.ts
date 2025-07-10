import { z } from 'zod';
import { TransactionType } from './types';

export const InventoryTransactionCreationValidationSchema = z.object({
  productId: z.string({
    required_error: 'Product ID is required',
  }),
  transactionType: z.enum([TransactionType.PURCHASE, TransactionType.DISTRIBUTION, TransactionType.RETURN], {
    required_error: 'Transaction type is required',
  }),
  quantity: z.number({
    required_error: 'Quantity is required',
  }),
  unitPrice: z.number({
    required_error: 'Unit price is required',
  }).min(0, 'Unit price cannot be negative'),
  relatedInvoiceId: z.string().optional(),
  relatedReturnId: z.string().optional(),
  providerId: z.string().optional(),
  zoneId: z.string().optional(),
  remarks: z.string().optional(),
});

export const InventoryTransactionUpdateValidationSchema = InventoryTransactionCreationValidationSchema.partial();
