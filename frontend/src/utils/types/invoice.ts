import { StdioNull } from 'child_process';
import { IBill } from './bill';

export enum InvoiceType {
  PROVIDER = 'provider',
  ZONE = 'zone',
  COMPANY = 'company',
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  fromUserId: string;
  toProviderId?: string | null;
  toZoneId?: string | null;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  invoiceDate: string;
  discountType?: 'percentage' | 'amount';
  discountValue?: number;
  createdAt: string;
  updatedAt: string;
  ReceiverProvider?: {
    id: string;
    name: string;
  };
  ReceiverZone?: {
    id: string;
    name: string;
  };
}

export interface IInvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface IInvoiceWithItems extends IInvoice {
  InvoiceItems: IInvoiceItem[];
  bills: IBill[];
}