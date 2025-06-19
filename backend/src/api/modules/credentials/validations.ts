import { z } from 'zod';
import { UserBodyValidationSchema } from '../users/validations';

export const CredentialBodyValidationSchema = UserBodyValidationSchema.merge(
  z.object({
    password: z
      .string({ required_error: 'Password is required!' })
      .min(8, 'Password needs to be more then 8 characters long'),
    name: z.string({required_error: 'Company name is required'}),
    logo: z.string().optional()
  }),
);

export const LoginCredentialBodyValidationSchema = z.object({
  password: z.string({ required_error: 'Password is required!' }).min(1, 'Password is required!'),
  email: z.string({ required_error: 'Email is required!' }).min(1, 'Email is required!').email(),
});

export const SwitchCompanyBodyValidationSchema = z.object({
  companyId: z.string({ required_error: 'Company Id is required!' }),
});
