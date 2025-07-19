import { useGetPaymentsQuery, useDeletePaymentMutation } from "@/store/services/payment";
import { Payment } from "@/utils/types/payment";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError, formatCurrency, formatDate } from "@/lib/utils";
import EditPaymentDialog from "./edit-payment-dialog";
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table";
import { Trash } from "lucide-react";

export default function PaymentsTable() {
  const { data, isLoading } = useGetPaymentsQuery({});
  const [deletePayment] = useDeletePaymentMutation();
  const { toast } = useToast();

  const handleDelete = async (payment: Payment) => {
    const result = await deletePayment(payment.id);
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
  };

  const columns: SimpleColumn<Payment>[] = [
    {
      key: 'invoiceId',
      header: 'Invoice ID',
      render: (_, payment) =>
        payment.invoiceId ? (
          <a href={`/invoices/${payment.invoiceId}`} className="text-blue-500 hover:underline">
            {payment.invoiceId.substring(0, 8)}
          </a>
        ) : (
          <span className="text-gray-400">No Invoice</span>
        )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => formatCurrency(value as number)
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (value) => formatDate(value as string)
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (value) => (value as string).replace('_', ' '),
      className: 'capitalize'
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value) => (value as string) || '-'
    }
  ];

  const actions: ActionButton<Payment>[] = [
    {
      type: 'delete',
      icon: <Trash className="h-4 w-4" />,
      onClick: handleDelete,
      confirmMessage: "Are you sure you want to delete this payment?"
    }
  ];

  return (
    <DataTable
      data={data || []}
      columns={columns}
      actions={actions}
      customActions={(payment) => <EditPaymentDialog payment={payment} />}
      isLoading={isLoading}
      keyExtractor={(payment) => payment.id}
      emptyMessage="No payments found"
    />
  );
}