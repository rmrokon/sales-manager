import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { useGetPaymentsQuery, useDeletePaymentMutation } from "@/store/services/payment";
import { Payment } from "@/utils/types/payment";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import EditPaymentDialog from "./edit-payment-dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsTable() {
  const { data, isLoading } = useGetPaymentsQuery({});
  const [deletePayment] = useDeletePaymentMutation();
  const { toast } = useToast();

  if (isLoading) return <Spinner />;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      const result = await deletePayment(id);
      if (isRtkQueryError(result) && result.error.data.success === false) {
        toast({
          variant: "destructive",
          description: `${result.error.data.message}`
        });
      } else {
        toast({
          description: "Payment deleted successfully"
        });
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Date</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((payment: Payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.invoiceId ? 
                <a href={`/invoices/${payment.invoiceId}`} className="text-blue-500 hover:underline">
                  {payment.invoiceId.substring(0, 8)}
                </a> : 
                <span className="text-gray-400">No Invoice</span>
              }
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
            <TableCell className="capitalize">{payment.paymentMethod.replace('_', ' ')}</TableCell>
            <TableCell>{payment.remarks || '-'}</TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center gap-2">
                <EditPaymentDialog payment={payment} />
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => handleDelete(payment.id)}
                >
                  <Delete className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}