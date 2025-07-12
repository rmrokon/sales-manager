"use client"
import { useGetPaymentsQuery } from "@/store/services/payment";
import { useGetReturnsByInvoiceQuery } from "@/store/services/returns-api";
import { Payment } from "@/utils/types/payment";
import { ProductReturn } from "@/store/services/returns-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface InvoicePaymentsProps {
  invoiceId: string;
}

// Combined transaction type for display
interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'payment' | 'return';
  method?: string;
  remarks?: string;
  status?: string;
}

export default function InvoicePayments({ invoiceId }: InvoicePaymentsProps) {
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery({ invoiceId });
  const { data: returns, isLoading: returnsLoading } = useGetReturnsByInvoiceQuery(invoiceId);

  const isLoading = paymentsLoading || returnsLoading;

  if (isLoading) return <Spinner />;

  // Combine payments and returns into a single transactions array
  const transactions: Transaction[] = [
    ...(payments || []).map((payment: Payment) => ({
      id: payment.id,
      date: payment.paymentDate,
      amount: payment.amount,
      type: 'payment' as const,
      method: payment.paymentMethod,
      remarks: payment.remarks,
    })),
    ...(returns.result || []).map((returnItem: ProductReturn) => ({
      id: returnItem.id,
      date: returnItem.createdAt,
      amount: returnItem.totalReturnAmount,
      type: 'return' as const,
      status: returnItem.status,
      remarks: returnItem.remarks,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment and Return History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No payments or returns recorded for this invoice.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment and Return History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method/Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'payment' ? 'default' : 'secondary'}>
                    {transaction.type === 'payment' ? 'Payment' : 'Return'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={
                    transaction.type === 'payment'
                      ? 'text-green-600'
                      : transaction.status === 'approved'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                  }>
                    {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.type === 'payment'
                    ? (transaction.method?.replace('_', ' ') || '-')
                    : (
                      <Badge variant={
                        transaction.status === 'approved' ? 'default' :
                        transaction.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {transaction.status}
                      </Badge>
                    )
                  }
                </TableCell>
                <TableCell>{transaction.remarks || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}