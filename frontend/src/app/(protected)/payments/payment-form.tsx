'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreatePaymentMutation, useUpdatePaymentMutation } from "@/store/services/payment";
import { useGetInvoicesQuery } from "@/store/services/invoice";
import { Payment, PaymentMethod } from "@/utils/types/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IInvoice } from "@/utils/types/invoice";

const paymentSchema = z.object({
  invoiceId: z.string().optional(),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be positive"),
  paymentDate: z.string({
    required_error: "Payment date is required"
  }),
  paymentMethod: z.nativeEnum(PaymentMethod, {required_error: "Payment method is required"}),
  remarks: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  defaultValues?: Partial<Payment>;
  preselectedInvoiceId?: string;
  onSuccess?: () => void;
}

export default function PaymentForm({ defaultValues, preselectedInvoiceId, onSuccess }: PaymentFormProps) {
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetInvoicesQuery({});
  const { close } = useDialog();
  const { toast } = useToast();
  const router = useRouter();
  
  const isEditing = Boolean(defaultValues?.id);
  const isLoading = isCreating || isUpdating || isLoadingInvoices;
  
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      invoiceId: preselectedInvoiceId || defaultValues?.invoiceId || '',
      amount: defaultValues?.amount || undefined,
      paymentDate: defaultValues?.paymentDate
        ? new Date(defaultValues.paymentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      paymentMethod: defaultValues?.paymentMethod as PaymentMethod || PaymentMethod.CASH,
      remarks: defaultValues?.remarks || ''
    }
  });
  
  const handleSavePayment = async (data: PaymentFormData) => {
    try {
      if (isEditing && defaultValues?.id) {
        await updatePayment({
          id: defaultValues.id,
          ...data
        }).unwrap();
        
        toast({
          description: "Payment updated successfully"
        });
      } else {
        await createPayment(data).unwrap();
        
        toast({
          description: "Payment created successfully"
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/payments');
      }
      
      if (close) close();
    } catch (error) {
      if (isRtkQueryError(error) && error.error?.data?.success === false) {
        toast({
          variant: "destructive",
          description: `${error.error?.data.message}`
        });
      } else {
        toast({
          variant: "destructive",
          description: "An error occurred"
        });
      }
    }
  };
  
  if (isLoading) return <Spinner />;
  
  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleSavePayment)}>
      <div>
        <Label htmlFor="invoiceId">Invoice (Optional)</Label>
        <Select 
          defaultValue={preselectedInvoiceId || defaultValues?.invoiceId || ''} 
          onValueChange={(value) => setValue('invoiceId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an invoice (optional)" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">No Invoice</SelectItem> */}
            {invoicesData?.result.map((invoice: IInvoice) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                Invoice #{invoice.id.substring(0, 8)} - ${invoice.totalAmount}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.invoiceId && <ErrorMessage message={errors.invoiceId.message ?? ''} />}
      </div>
      
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <ErrorMessage message={errors.amount.message ?? ''} />}
      </div>
      
      <div>
        <DatePicker
          label="Payment Date"
          id="paymentDate"
          value={(() => {
            const dateValue = watch('paymentDate');
            if (!dateValue) return undefined;
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? undefined : date;
          })()}
          onChange={(date) => {
            if (date) {
              setValue('paymentDate', date.toISOString().split('T')[0]);
            } else {
              setValue('paymentDate', '');
            }
          }}
          placeholder="Select payment date"
        />
        {errors.paymentDate && <ErrorMessage message={errors.paymentDate.message ?? ''} />}
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select 
          defaultValue={defaultValues?.paymentMethod || PaymentMethod.CASH} 
          onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
            <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
            <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
            <SelectItem value={PaymentMethod.ONLINE}>Online</SelectItem>
            <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && <ErrorMessage message={errors.paymentMethod.message ?? ''} />}
      </div>
      
      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          {...register('remarks')}
          placeholder="Add any additional notes here"
        />
        {errors.remarks && <ErrorMessage message={errors.remarks.message ?? ''} />}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (close) close();
            else router.push('/payments');
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isEditing ? 'Update' : 'Create'} Payment
        </Button>
      </div>
    </form>
  );
}