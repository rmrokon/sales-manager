'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateReturnMutation } from '@/store/services/returns-api';
import { toast } from '@/hooks/use-toast';
import { useGetInvoicesQuery } from '@/store/services/invoice';
import { useGetProductsQuery } from '@/store/services/product';
import { IProduct } from '@/utils/types/product';
import { IInvoice } from '@/utils/types/invoice';

const returnItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  returnedQuantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  returnAmount: z.number().min(0, 'Return amount cannot be negative'),
});

const createReturnSchema = z.object({
  originalInvoiceId: z.string().min(1, 'Invoice is required'),
  zoneId: z.string().min(1, 'Zone is required'),
  totalReturnAmount: z.number().min(0, 'Total return amount cannot be negative'),
  remarks: z.string().optional(),
  returnItems: z.array(returnItemSchema).min(1, 'At least one return item is required'),
  paymentAmount: z.number().min(0, 'Payment amount cannot be negative').optional(),
  returnDate: z.string({
    required_error: "Return date is required"
  }),
});

type CreateReturnFormData = z.infer<typeof createReturnSchema>;

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReturnDialog({ open, onOpenChange }: CreateReturnDialogProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);

  const { data: invoices } = useGetInvoicesQuery({ type: 'zone' });
  const { data: products } = useGetProductsQuery({});
  const [createReturn, { isLoading }] = useCreateReturnMutation();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateReturnFormData>({
    resolver: zodResolver(createReturnSchema),
    defaultValues: {
      originalInvoiceId: '',
      zoneId: '',
      totalReturnAmount: 0,
      remarks: '',
      returnItems: [
        {
          productId: '',
          returnedQuantity: undefined,
          unitPrice: undefined,
          returnAmount: 0,
        },
      ],
      paymentAmount: undefined,
      returnDate: new Date().toISOString().split('T')[0],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'returnItems',
  });

  const watchReturnItems = watch('returnItems');

  // Calculate total return amount when items change
  useEffect(() => {
    const total = watchReturnItems.reduce((sum, item) => sum + (item.returnAmount || 0), 0);
    setValue('totalReturnAmount', total);
  }, [watchReturnItems, setValue]);

  // Update zone when invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      setValue('zoneId', selectedInvoice.toZoneId || '');
    }
  }, [selectedInvoice, setValue]);

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices?.result?.find((inv: IInvoice) => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);
    setValue('originalInvoiceId', invoiceId);
  };

  const handleQuantityOrPriceChange = (index: number, field: 'returnedQuantity' | 'unitPrice', value: number) => {
    const currentItems = watch('returnItems');
    const currentItem = currentItems[index];
    const quantity = field === 'returnedQuantity' ? value : currentItem.returnedQuantity;
    const unitPrice = field === 'unitPrice' ? value : currentItem.unitPrice;
    const returnAmount = quantity * unitPrice;

    setValue(`returnItems.${index}.${field}`, value);
    setValue(`returnItems.${index}.returnAmount`, returnAmount);
  };

  const onSubmit = async (data: CreateReturnFormData) => {
    try {
      await createReturn({...data}).unwrap();
      toast({
        title: 'Success',
        description: 'Return created successfully',
      });
      reset();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create return',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product Return</DialogTitle>
          <DialogDescription>
            Create a new product return for a zone invoice
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalInvoiceId">Original Invoice</Label>
              <Select onValueChange={handleInvoiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices?.result?.map((invoice: IInvoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.id} - {invoice.ReceiverZone?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.originalInvoiceId && (
                <ErrorMessage message={errors.originalInvoiceId.message ?? ''} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (Optional)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('paymentAmount', { valueAsNumber: true })}
              />
              {errors.paymentAmount && (
                <ErrorMessage message={errors.paymentAmount.message ?? ""} />
              )}
            </div>

            <div className="space-y-2">
              <DatePicker
                label="Return Date"
                id="returnDate"
                value={watch('returnDate') ? new Date(watch('returnDate')) : undefined}
                onChange={(date) => {
                  setValue('returnDate', date ? date.toISOString().split('T')[0] : '')
                }}
                placeholder="Select return date"
              />
              {errors.returnDate && (
                <ErrorMessage message={errors.returnDate.message ?? ""} />
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Return Items
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      productId: '',
                      returnedQuantity: 1,
                      unitPrice: 0,
                      returnAmount: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select onValueChange={(value) => setValue(`returnItems.${index}.productId`, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.result?.map((product: IProduct) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.returnItems?.[index]?.productId && (
                      <ErrorMessage message={errors.returnItems[index]?.productId?.message ?? ""} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`returnItems.${index}.returnedQuantity`, {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const value = parseInt(e.target.value) || 1;
                          handleQuantityOrPriceChange(index, 'returnedQuantity', value);
                        }
                      })}
                    />
                    {errors.returnItems?.[index]?.returnedQuantity && (
                      <ErrorMessage message={errors.returnItems[index]?.returnedQuantity?.message ?? ""} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`returnItems.${index}.unitPrice`, {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleQuantityOrPriceChange(index, 'unitPrice', value);
                        }
                      })}
                    />
                    {errors.returnItems?.[index]?.unitPrice && (
                      <ErrorMessage message={errors.returnItems[index]?.unitPrice?.message ?? ""} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Return Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      readOnly
                      {...register(`returnItems.${index}.returnAmount`, { valueAsNumber: true })}
                    />
                    {errors.returnItems?.[index]?.returnAmount && (
                      <ErrorMessage message={errors.returnItems[index]?.returnAmount?.message ?? ""} />
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalReturnAmount">Total Return Amount</Label>
              <Input
                id="totalReturnAmount"
                type="number"
                step="0.01"
                readOnly
                className="bg-muted font-semibold"
                {...register('totalReturnAmount', { valueAsNumber: true })}
              />
              {errors.totalReturnAmount && (
                <ErrorMessage message={errors.totalReturnAmount.message ?? ""} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Additional notes about the return..."
                {...register('remarks')}
              />
              {errors.remarks && (
                <ErrorMessage message={errors.remarks.message ?? ""} />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Return'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
