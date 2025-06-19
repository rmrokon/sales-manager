import { z } from 'zod';

export const CompanyCreationValidationSchema = z.object({
  name: z.string({required_error: 'Company name is required'}),
  logo: z.string().optional(),
  default: z.boolean().optional(),
  user_id: z.string().optional()
});


export const CompanyUpdateValidationSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  default: z.boolean().optional(),
});

