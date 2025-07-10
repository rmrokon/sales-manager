"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateBillMutation } from "@/store/services/bill"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@/components/ui/error"
import { isRtkQueryError } from "@/lib/utils"
import { IBill } from "@/utils/types/bill"

const billSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive")
})

type BillFormData = z.infer<typeof billSchema>

interface EditBillDialogProps {
  bill: IBill
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditBillDialog({ bill, open, onOpenChange }: EditBillDialogProps) {
  const [updateBill, { isLoading }] = useUpdateBillMutation()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: bill.title,
      description: bill.description || "",
      amount: bill.amount
    }
  })

  useEffect(() => {
    if (bill) {
      reset({
        title: bill.title,
        description: bill.description || "",
        amount: bill.amount
      })
    }
  }, [bill, reset])

  const onSubmit = async (data: BillFormData) => {
    try {
      await updateBill({ id: bill.id, ...data }).unwrap()
      toast({
        description: "Bill updated successfully"
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Update bill error:', error)
      toast({
        variant: "destructive",
        description: "Failed to update bill"
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
          <DialogTitle>Edit Bill</DialogTitle>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Update Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
