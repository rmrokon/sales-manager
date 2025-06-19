import { z } from 'zod';

export const PaymentCreationValidationSchema = z.object({
  invoiceId: z.string({required_error: 'Invoice ID is required'}),
  amount: z.number({required_error: 'Amount is required'}).positive('Amount must be positive'),
  paymentDate: z.string().or(z.date()).transform(val => new Date(val)),
  paymentMethod: z.string({required_error: 'Payment method is required'}),
  remarks: z.string().optional()
});

export const PaymentUpdateValidationSchema = z.object({
  invoiceId: z.string().optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  paymentDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  paymentMethod: z.string().optional(),
  remarks: z.string().optional()
});