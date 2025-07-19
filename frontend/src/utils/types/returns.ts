import { IProduct } from "./product";

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ReturnItem {
  id?: string;
    productId: string;
    returnedQuantity: number;
    unitPrice: number;
    returnAmount: number;
    product?: Partial<IProduct>
}

export interface CreateReturnParams {
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  remarks?: string;
  returnItems: ReturnItem[];
  paymentAmount?: number;
}

export interface UpdateReturnParams {
  status?: ReturnStatus
  remarks?: string;
}

export interface ProductReturn {
  id: string;
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  status: ReturnStatus
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  zone?: {
    id: string;
    name: string;
  };
  originalInvoice?: {
    id: string;
    invoiceNumber: string;
  };
  returnItems?: ReturnItem[];
}