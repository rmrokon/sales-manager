import { z } from 'zod';

export const ZoneCreationValidationSchema = z.object({
  name: z.string({required_error: 'Zone name is required'}),
  company_id: z.string({required_error: 'Company ID is required'})
});

export const ZoneUpdateValidationSchema = z.object({
  name: z.string().optional(),
  company_id: z.string().optional()
});