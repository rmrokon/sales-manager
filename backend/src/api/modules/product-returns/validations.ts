import { z } from 'zod';
import { ReturnStatus } from './types';

export const ProductReturnItemValidationSchema = z.object({
  productId: z.string({
    required_error: 'Product ID is required',
  }),
  returnedQuantity: z.number({
    required_error: 'Returned quantity is required',
  }).min(1, 'Returned quantity must be at least 1'),
  unitPrice: z.number({
    required_error: 'Unit price is required',
  }).min(0, 'Unit price cannot be negative'),
  returnAmount: z.number({
    required_error: 'Return amount is required',
  }).min(0, 'Return amount cannot be negative'),
});

export const ProductReturnCreationValidationSchema = z.object({
  originalInvoiceId: z.string({
    required_error: 'Original invoice ID is required',
  }),
  zoneId: z.string({
    required_error: 'Zone ID is required',
  }),
  totalReturnAmount: z.number({
    required_error: 'Total return amount is required',
  }).min(0, 'Total return amount cannot be negative'),
  remarks: z.string().optional(),
  returnItems: z.array(ProductReturnItemValidationSchema).min(1, 'At least one return item is required'),
  paymentAmount: z.number().min(0, 'Payment amount cannot be negative').optional(),
  status: z.nativeEnum(ReturnStatus).optional()
}).refine(data => {
  // Validate that total return amount matches sum of return items
  const calculatedTotal = data.returnItems.reduce((sum, item) => sum + item.returnAmount, 0);
  return Math.abs(data.totalReturnAmount - calculatedTotal) < 0.01; // Allow for small floating point differences
}, {
  message: 'Total return amount must equal sum of return item amounts',
  path: ['totalReturnAmount']
});

export const ProductReturnUpdateValidationSchema = z.object({
  status: z.enum([ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.REJECTED]).optional(),
  remarks: z.string().optional(),
});
