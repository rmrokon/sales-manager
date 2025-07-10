"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateBillMutation } from "@/store/services/bill"
import { useGetInvoicesQuery } from "@/store/services/invoice"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@/components/ui/error"
import { isRtkQueryError } from "@/lib/utils"

const billSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  invoiceId: z.string().min(1, "Invoice is required")
})

type BillFormData = z.infer<typeof billSchema>

interface CreateBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateBillDialog({ open, onOpenChange }: CreateBillDialogProps) {
  const [createBill, { isLoading }] = useCreateBillMutation()
  const { data: invoicesData } = useGetInvoicesQuery({})
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      invoiceId: ""
    }
  })

  const onSubmit = async (data: BillFormData) => {
    try {
      await createBill(data).unwrap()
      toast({
        description: "Bill created successfully"
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Create bill error:', error)
      toast({
        variant: "destructive",
        description: "Failed to create bill"
      })
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter bill title"
            />
            {errors.title && <ErrorMessage message={errors.title.message ?? ''} />}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter bill description (optional)"
              rows={3}
            />
            {errors.description && <ErrorMessage message={errors.description.message ?? ''} />}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register("amount", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.amount && <ErrorMessage message={errors.amount.message ?? ''} />}
          </div>

          <div>
            <Label htmlFor="invoiceId">Invoice</Label>
            <Select onValueChange={(value) => setValue("invoiceId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoicesData?.result?.map((invoice: any) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    #{invoice.id.substring(0, 8)} - {invoice.ReceiverProvider?.name || invoice.ReceiverZone?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.invoiceId && <ErrorMessage message={errors.invoiceId.message ?? ''} />}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Create Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
