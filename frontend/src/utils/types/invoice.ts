export enum InvoiceType {
  PROVIDER = 'provider',
  ZONE = 'zone',
}

export interface IInvoice {
  id: string;
  type: InvoiceType;
  fromUserId: string;
  toProviderId?: string;
  toZoneId?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
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
  Product?: {
    id: string;
    name: string;
    price: number;
  };
}