export interface Payment {
  id: string;
  invoiceId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  CHECK = "check",
  ONLINE = "online",
  OTHER = "other"
}