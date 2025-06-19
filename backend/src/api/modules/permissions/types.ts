import { z } from 'zod';
import { PermissionBodyValidationSchema } from './validations';
import Permission from './model';
import { Attributes, CreationAttributes } from '@sequelize/core';

export interface IPermission extends Attributes<Permission>{};
export type ICreatePermission = CreationAttributes<Permission>;

export type IPermissionRequestBody = z.infer<typeof PermissionBodyValidationSchema>;
