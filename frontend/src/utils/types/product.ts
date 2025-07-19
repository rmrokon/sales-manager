import { IProvider } from "./provider";

export interface IProduct {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  price?: number; // Keep for backward compatibility during migration
  description?: string;
  company_id?: string;
  providers?: IProvider[];
  createdAt: string;
  updatedAt: string;
}
