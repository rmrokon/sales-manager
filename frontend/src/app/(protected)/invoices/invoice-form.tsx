"use client"
import { Button } from "@/components/ui/button"
import { ErrorMessage } from "@/components/ui/error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { DiscountInput, DiscountValue, applyDiscount } from "@/components/ui/discount-input"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import { useCreateInvoiceMutation, useUpdateInvoiceMutation } from "@/store/services/invoice"
import { useGetProvidersQuery } from "@/store/services/provider"
import { useGetZonesQuery } from "@/store/services/zone"
import { RootState } from "@/store/store"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { z } from "zod"
import InvoiceItemsForm from "./invoice-items-form"
import { IProvider } from "@/utils/types/provider"
import BillItemsForm from "./bill-items-form"

const invoiceSchema = z.object({
  type: z.enum([InvoiceType.PROVIDER, InvoiceType.ZONE, InvoiceType.COMPANY], {
    required_error: "Invoice type is required"
  }),
  fromUserId: z.string({
    required_error: "Sender user ID is required"
  }),
  toProviderId: z.string().optional().nullable(),
  toZoneId: z.string().optional().nullable(),
  totalAmount: z.number({
    required_error: "Total amount is required"
  }).min(0, "Total amount cannot be negative"),
  paidAmount: z.number({
    required_error: "Paid amount is required"
  }).min(0, "Paid amount cannot be negative").default(0),
  dueAmount: z.number({
    required_error: "Due amount is required"
  }).min(0, "Due amount cannot be negative"),
  invoiceDate: z.string({
    required_error: "Invoice date is required"
  }),
  discountType: z.enum(['percentage', 'amount']).default('percentage'),
  discountValue: z.number().min(0, "Discount cannot be negative").default(0)
}).refine(data => {
  if (data.type === InvoiceType.PROVIDER && !data.toProviderId) {
    return false;
  }
  if (data.type === InvoiceType.ZONE && !data.toZoneId) {
    return false;
  }
  return true;
}, {
  message: "Provider invoice must have toProviderId, Zone invoice must have toZoneId",
  path: ["type"]
}).refine(data => {
  return data.dueAmount === data.totalAmount - data.paidAmount;
}, {
  message: "Due amount must equal total amount minus paid amount",
  path: ["dueAmount"]
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  defaultValues?: Partial<IInvoice>;
  onSuccess?: () => void;
}

export default function InvoiceForm({ defaultValues, onSuccess }: InvoiceFormProps) {
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const { data: providersData, isLoading: isLoadingProviders } = useGetProvidersQuery({});
  const { data: zonesData, isLoading: isLoadingZones } = useGetZonesQuery({});
  const { user, company } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isBill, setIsBill] = useState(false);
  const [discount, setDiscount] = useState<DiscountValue>({ type: 'percentage', value: 0 });
  
  const isEditing = Boolean(defaultValues?.id);
  const isLoading = isCreating || isUpdating || isLoadingProviders || isLoadingZones;
  
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      type: defaultValues?.type || InvoiceType.PROVIDER,
      fromUserId: user?.id || '',
      toProviderId: defaultValues?.toProviderId || '',
      toZoneId: defaultValues?.toZoneId || '',
      totalAmount: defaultValues?.totalAmount || 0,
      paidAmount: defaultValues?.paidAmount || undefined,
      dueAmount: defaultValues?.dueAmount || 0,
      invoiceDate: defaultValues?.invoiceDate
        ? new Date(defaultValues.invoiceDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      discountType: defaultValues?.discountType || 'percentage',
      discountValue: defaultValues?.discountValue || 0
    }
  });
  
  const invoiceType = watch('type');
  const paidAmount = watch('paidAmount');

  // Automatically set bill mode for company invoices
  useEffect(() => {
    if (invoiceType === InvoiceType.COMPANY) {
      setIsBill(true);
    } else {
      // Allow manual toggle for provider and zone invoices
      // Don't automatically set to false to preserve user choice
    }
  }, [invoiceType]);

  // Update total amount when line items change
  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      if (isBill) {
        return sum + (item.amount || 0);
      }
      const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent / 100));
      return sum + itemTotal;
    }, 0);

    // Apply overall discount
    const finalTotal = applyDiscount(discount, subtotal);

    setTotalAmount(finalTotal);
    setValue('totalAmount', finalTotal);
    setValue('dueAmount', finalTotal - (paidAmount || 0));
  }, [lineItems, paidAmount, discount, setValue, isBill]);
  
  // Update due amount when paid amount changes
  useEffect(() => {
    setValue('dueAmount', totalAmount - (paidAmount || 0));
  }, [paidAmount, totalAmount, setValue]);
  
  const onSubmit = async (data: InvoiceFormData) => {
    try {
      
      if (isEditing && defaultValues?.id) {
        await updateInvoice({
          id: defaultValues.id,
          ...data,
        }).unwrap();
        
        toast({
          description: "Invoice updated successfully"
        });
      } else {
        if(invoiceType === InvoiceType.PROVIDER) delete data.toZoneId
        else if(invoiceType === InvoiceType.COMPANY) {
          delete data.toProviderId;
          delete data.toZoneId
        }
        else delete data.toProviderId
        
        const invoiceData = {
          ...data,
          company_id: company?.id,
          items: isBill ? undefined : lineItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: +item.unitPrice,
            discountPercent: item.discountPercent || 0
          })),
          bills: isBill ? lineItems.map(item => ({
            title: item.title,
            description: item.description,
            amount: +item.amount
          })) : undefined
        };
        // if(data.type === InvoiceType.COMPANY){
        //   data.toZoneId = null;
        //   data.toProviderId = null;
        // }
        await createInvoice(invoiceData).unwrap();
        
        toast({
          description: "Invoice created successfully"
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/invoices');
      }
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
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label>Invoice Type</Label>
            <RadioGroup 
              defaultValue={invoiceType} 
              onValueChange={(value) => setValue('type', value as InvoiceType)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={InvoiceType.PROVIDER} id="provider" />
                <Label htmlFor="provider">Provider</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={InvoiceType.ZONE} id="zone" />
                <Label htmlFor="zone">Zone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={InvoiceType.COMPANY} id="company" />
                <Label htmlFor="company">Company</Label>
              </div>
            </RadioGroup>
            {errors.type && <ErrorMessage message={errors.type.message ?? ''} />}
          </div>
          
          {invoiceType === InvoiceType.PROVIDER && (
            <div>
              <Label htmlFor="toProviderId">Provider</Label>
              <Select 
                defaultValue={defaultValues?.toProviderId ? defaultValues?.toProviderId : ""} 
                onValueChange={(value) => setValue('toProviderId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providersData?.result.map((provider: IProvider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toProviderId && <ErrorMessage message={errors.toProviderId.message ?? ''} />}
            </div>
          )}
          
          {invoiceType === InvoiceType.ZONE && (
            <div>
              <Label htmlFor="toZoneId">Zone</Label>
              <Select 
                defaultValue={defaultValues?.toZoneId ? defaultValues?.toZoneId : ""} 
                onValueChange={(value) => setValue('toZoneId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zonesData?.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toZoneId && <ErrorMessage message={errors.toZoneId.message ?? ''} />}
            </div>
          )}

          <div>
            <DatePicker
              label="Invoice Date"
              id="invoiceDate"
              value={watch('invoiceDate') ? new Date(watch('invoiceDate')) : undefined}
              onChange={(date) => {
                setValue('invoiceDate', date ? date.toISOString().split('T')[0] : '')
              }}
              placeholder="Select invoice date"
            />
            {errors.invoiceDate && <ErrorMessage message={errors.invoiceDate.message ?? ''} />}
          </div>
        </div>
      </div>
      
      {invoiceType !== InvoiceType.COMPANY && (
        <div className="flex items-center space-x-2">
          <Switch id="is-bill-switch" checked={isBill} onCheckedChange={setIsBill} />
          <Label htmlFor="is-bill-switch">Is Bill?</Label>
        </div>
      )}

      {invoiceType === InvoiceType.COMPANY && (
        <div className="text-sm text-muted-foreground">
          Company invoices are automatically set to bill mode.
        </div>
      )}
      
      {isBill ? (
        <BillItemsForm items={lineItems} onChange={setLineItems} />
      ) : (
        <InvoiceItemsForm
          items={lineItems}
          onChange={setLineItems}
          invoiceType={invoiceType}
        />
      )}

      {/* Right-aligned sections after line items */}
      <div className="flex justify-end">
        <div className="w-full max-w-md space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold">
              ${lineItems.reduce((sum, item) => {
                if (isBill) {
                  return sum + (item.amount || 0);
                }
                const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent / 100));
                return sum + itemTotal;
              }, 0).toFixed(2)}
            </span>
          </div>

          {/* Discount Section */}
          <DiscountInput
            label="Discount"
            value={discount}
            onChange={(newDiscount) => {
              setDiscount(newDiscount);
              setValue('discountType', newDiscount.type);
              setValue('discountValue', newDiscount.value);
            }}
            totalAmount={lineItems.reduce((sum, item) => {
              if (isBill) {
                return sum + (item.amount || 0);
              }
              const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent / 100));
              return sum + itemTotal;
            }, 0)}
            showCalculation={false}
          />

          {/* Paid Amount Section */}
          <div>
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              id="paidAmount"
              type="number"
              defaultValue={0}
              step="0.01"
              {...register('paidAmount', { valueAsNumber: true })}
            />
            {errors.paidAmount && <ErrorMessage message={errors.paidAmount.message ?? ''} />}
          </div>

          {/* Final calculations */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="font-semibold">${(paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Due Amount:</span>
              <span>${(totalAmount - (paidAmount || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/invoices')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isEditing ? 'Update' : 'Create'} Invoice
        </Button>
      </div>
    </form>
  );
}
