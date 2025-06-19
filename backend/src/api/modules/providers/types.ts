import { z } from 'zod';
import { ProviderBodyValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Provider from './model';

export interface IProvider extends Attributes<Provider>{};
export type ICreateProvider = CreationAttributes<Provider>;

export type IProviderRequestBody = z.infer<typeof ProviderBodyValidationSchema>;
