'use client';

import { useGetReturnByIdQuery } from '@/store/services/returns-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface ProductReturn {
  id: string;
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
  Zone?: {
    name: string;
  };
  OriginalInvoice?: {
    invoiceNumber: string;
  };
}

interface ViewReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnData: ProductReturn;
}

export function ViewReturnDialog({ open, onOpenChange, returnData }: ViewReturnDialogProps) {
  const { data: fullReturnData, isLoading } = useGetReturnByIdQuery(returnData.id, {
    skip: !open,
  });

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

  const returnInfo = fullReturnData?.result || returnData;
  console.log({returnInfo})
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Return Details</DialogTitle>
          <DialogDescription>
            View detailed information about this product return
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading return details...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Return Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Return Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Original Invoice
                    </label>
                    <p className="text-sm">
                      {returnInfo.originalInvoiceId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Zone
                    </label>
                    <p className="text-sm">{returnInfo.zone?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Return Amount
                    </label>
                    <p className="text-sm font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(returnInfo.totalReturnAmount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(returnInfo.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-sm">
                      {format(new Date(returnInfo.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {returnInfo.remarks && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Remarks
                      </label>
                      <p className="text-sm mt-1">{returnInfo.remarks}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Return Items */}
            {returnInfo?.returnItems && returnInfo.returnItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {returnInfo.returnItems.map((item: any, index: number) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.product?.name || 'Unknown Product'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.returnedQuantity} × ${item.unitPrice}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(item.returnAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
