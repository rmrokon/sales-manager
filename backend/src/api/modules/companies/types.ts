import z from "zod";
import {CompanyCreationValidationSchema, CompanyUpdateValidationSchema} from './validations'

export interface ICompany {
  id: string;
  name: string;
  logo?: string;
  default?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type ICompanyCreationBody = z.infer<typeof CompanyCreationValidationSchema>;
export type ICompnayUpdateBody = z.infer<typeof CompanyUpdateValidationSchema>;
