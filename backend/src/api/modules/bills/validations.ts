import { z } from 'zod';

export const BillCreationValidationSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  invoiceId: z.string(),
});

export const BillUpdateValidationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
});
