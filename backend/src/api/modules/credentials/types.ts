import { z } from 'zod';
import { IUser } from '../users/types';
import { CredentialBodyValidationSchema, LoginCredentialBodyValidationSchema } from './validations';
import { ICompany } from '../companies/types';
import { IRole } from '../roles/types';
import Role from '../roles/model';
import Permission from '../permissions/model';
import Company from '../companies/model';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Credential from './model';

export interface ICredential extends Attributes<Credential>{};
export type ICreateCredential = CreationAttributes<Credential>;
export type ICredentialRequestBody = z.infer<typeof CredentialBodyValidationSchema>;
export type ILoginCredentialRequestBody = z.infer<typeof LoginCredentialBodyValidationSchema>;
export type ICredentialTokenPayload = {
  uid: string;
  cid: string;
  user: IUser;
  roles: Role[] | undefined;
  permissions: (Permission | undefined)[];
  company?: Company | undefined;
  employeeId?: string;
};
