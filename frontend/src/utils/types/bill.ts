export interface IBill {
  id: string;
  title: string;
  description?: string;
  amount: number;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}
