"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const invoiceSchema = z.object({
  type: z.enum([InvoiceType.PROVIDER, InvoiceType.ZONE], {
    required_error: "Invoice type is required"
  }),
  fromUserId: z.string({
    required_error: "Sender user ID is required"
  }),
  toProviderId: z.string().optional(),
  toZoneId: z.string().optional(),
  totalAmount: z.number({
    required_error: "Total amount is required"
  }).min(0, "Total amount cannot be negative"),
  paidAmount: z.number({
    required_error: "Paid amount is required"
  }).min(0, "Paid amount cannot be negative").default(0),
  dueAmount: z.number({
    required_error: "Due amount is required"
  }).min(0, "Due amount cannot be negative")
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
  
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
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
      paidAmount: defaultValues?.paidAmount || 0,
      dueAmount: defaultValues?.dueAmount || 0
    }
  });
  
  const invoiceType = watch('type');
  const paidAmount = watch('paidAmount');
  
  // Update total amount when invoice items change
  useEffect(() => {
    const total = invoiceItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent / 100));
      return sum + itemTotal;
    }, 0);
    
    setTotalAmount(total);
    setValue('totalAmount', total);
    setValue('dueAmount', total - (paidAmount || 0));
  }, [invoiceItems, paidAmount, setValue]);
  
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
        else delete data.toProviderId
        // Create invoice with items in a single request
        const invoiceData = {
          ...data,
          company_id: company?.id, // Add company_id from Redux state
          items: invoiceItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: +item.unitPrice,
            discountPercent: item.discountPercent || 0
          }))
        };
        
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
            </RadioGroup>
            {errors.type && <ErrorMessage message={errors.type.message ?? ''} />}
          </div>
          
          {invoiceType === InvoiceType.PROVIDER && (
            <div>
              <Label htmlFor="toProviderId">Provider</Label>
              <Select 
                defaultValue={defaultValues?.toProviderId} 
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
                defaultValue={defaultValues?.toZoneId} 
                onValueChange={(value) => setValue('toZoneId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zonesData?.result.map((zone) => (
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
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              {...register('paidAmount', { valueAsNumber: true })}
            />
            {errors.paidAmount && <ErrorMessage message={errors.paidAmount.message ?? ''} />}
          </div>
        </div>
        
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="font-semibold">${(paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Due Amount:</span>
              <span className="font-semibold">${(totalAmount - (paidAmount || 0)).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
      
      <InvoiceItemsForm 
        items={invoiceItems} 
        onChange={setInvoiceItems} 
      />
      
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
