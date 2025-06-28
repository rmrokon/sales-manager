"use client"
import { useGetPaymentsQuery } from "@/store/services/payment";
import { Payment } from "@/utils/types/payment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

interface InvoicePaymentsProps {
  invoiceId: string;
}

export default function InvoicePayments({ invoiceId }: InvoicePaymentsProps) {
  const { data: payments, isLoading } = useGetPaymentsQuery({ invoiceId });
  
  if (isLoading) return <Spinner />;
  
  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No payments recorded for this invoice.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment: Payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="capitalize">{payment.paymentMethod.replace('_', ' ')}</TableCell>
                <TableCell>{payment.remarks || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}