import { IProvider } from "./provider";

export interface IProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  company_id?: string;
  providers?: IProvider[];
  createdAt: string;
  updatedAt: string;
}
