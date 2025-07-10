'use client';

import { useState } from 'react';
import { useGetReturnsQuery } from '@/store/services/returns-api';
import { DataTable, SimpleColumn, ActionButton } from '@/components/ui/reusable-table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ViewReturnDialog } from './view-return-dialog';
import { useApproveReturnMutation, useRejectReturnMutation } from '@/store/services/returns-api';
import { toast } from '@/hooks/use-toast';

interface ProductReturn {
  id: string;
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
  zone?: {
    name: string;
  };
  OriginalInvoice?: {
    invoiceNumber: string;
  };
}

export function ReturnsTable() {
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { data: returns = [], isLoading, refetch } = useGetReturnsQuery({});
  const [approveReturn] = useApproveReturnMutation();
  const [rejectReturn] = useRejectReturnMutation();
console.log('returns =====> ', {returns})
  const handleApprove = async (returnId: string) => {
    try {
      await approveReturn(returnId).unwrap();
      toast({
        title: 'Success',
        description: 'Return approved successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve return',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (returnId: string) => {
    try {
      await rejectReturn(returnId).unwrap();
      toast({
        title: 'Success',
        description: 'Return rejected successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject return',
        variant: 'destructive',
      });
    }
  };

  const handleViewReturn = (returnItem: ProductReturn) => {
    setSelectedReturn(returnItem);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: SimpleColumn<ProductReturn>[] = [
    {
      key: 'OriginalInvoice.invoiceNumber',
      header: 'Invoice Number',
      render: (_, row) => row.originalInvoiceId || 'N/A',
    },
    {
      key: 'Zone.name',
      header: 'Zone',
      render: (_, row) => row.zone?.name || 'N/A',
    },
    {
      key: 'totalReturnAmount',
      header: 'Return Amount',
      render: (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value as number),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value as string),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (value) => format(new Date(value as string), 'MMM dd, yyyy'),
    },
  ];

  const actions: ActionButton<ProductReturn>[] = [
    {
      type: 'view',
      onClick: handleViewReturn,
      tooltip: 'View Details',
    },
    {
      type: 'custom',
      onClick: (returnItem) => handleApprove(returnItem.id),
      tooltip: 'Approve Return',
      disabled: (returnItem) => returnItem.status.toLocaleLowerCase() !== 'pending',
      className: 'text-green-600 hover:text-green-700',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      type: 'custom',
      onClick: (returnItem) => handleReject(returnItem.id),
      tooltip: 'Reject Return',
      disabled: (returnItem) => returnItem.status.toLocaleLowerCase() !== 'pending',
      className: 'text-red-600 hover:text-red-700',
      icon: <XCircle className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <DataTable
        data={returns.result}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        keyExtractor={(returnItem) => returnItem.id}
        emptyMessage="No returns found"
      />

      {selectedReturn && (
        <ViewReturnDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          returnData={selectedReturn}
        />
      )}
    </>
  );
}
