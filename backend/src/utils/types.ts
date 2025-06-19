import { CreationOptional, Model } from '@sequelize/core';
import { Request } from 'express';

export interface PaginatedResponse<TItems> {
  nodes: TItems;
  page_info: {
    page: number;
    limit: number;
    total: number;
    overall: number;
    next: boolean;
    previous: boolean;
    total_page: number;
  };
}

export interface LoadersConfig {
  port: string | number;
  mongo_string: string;
}
export enum ResponsesModules {
  Companies = 'COMPANIES',
  Users = 'USERS',
  Permissions = 'PERMISSIONS',
  PermissionModules = 'PERMISSION_MODULES',
  Auth = 'AUTH',
}
export enum ResponsesFrom {
  System = 'SYSTEM',
}
export enum ResponsesActionsType {
  ALL = 'ALL',
  GET = 'GET',
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}
export interface ResponsesOptions {
  req?: Request;
  statusCode?: number;
  errors?: { path: string; message: string }[];
  module?: ResponsesModules;
  from?: ResponsesFrom;
  actionType?: ResponsesActionsType;
}
export interface LoginFormValues {
  email: string;
  password: string;
}
export interface ResendAccountActivationFormValues {
  hash: string;
}
export interface ForgotPasswordFormValues {
  email: string;
}
export interface ActivateAccountFormValues {
  code: string;
  hash: string;
}
export interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type?: AuthDocumentLoggedInThrough;
}
export interface MailOptions {
  to: string;
  subject: string;
  template: string;
}
export enum AuthDocumentLoggedInThrough {
  Email = 'EMAIL',
  Google = 'GOOGLE',
  Facebook = 'FACEBOOK',
}

export enum UserRoles {
  User = 'USER',
  Admin = 'ADMIN',
}

export enum LogFormatterType {
  System = 'SYSTEM',
}
export interface AccountActivationJwtPayload {
  email: string;
}


export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export type ReqQueryParams = {
  companyId?: string;
  created_at?: Date;
};

export type OtherProperties = {
  companyId: number;
  employeeId?: number;
  authUserId?: number;
  filterByEmployeeIds?: string;
  filterByCompanyIds?: string;
  filterByStatuses?: string;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface IDataValues<T> {
  dataValues: T;
}

export type PartialModel<T, K extends keyof T> = Omit<T, K> & {
  [k in K]: CreationOptional<T[k]>;
};
type DefaultCreationOptional = 'id' | 'createdAt' | 'updatedAt'
export type MakeModel<T extends object, K extends keyof T = DefaultCreationOptional extends keyof T ?  DefaultCreationOptional : never> = PartialModel<T, K> &
  Model<PartialModel<T, K>>;
