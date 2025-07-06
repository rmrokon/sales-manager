"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoayout } from "@/components"
import { useGetInvoiceWithItemsQuery, useRecordPaymentMutation } from "@/store/services/invoice"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { InvoiceType, IInvoiceItem } from "@/utils/types/invoice"
import { IBill } from "@/utils/types/bill"
import { Printer, ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import InvoiceTemplate from "../invoice-template"
import { Spinner } from "@/components/ui/spinner"
import InvoicePayments from "./invoice-payments";
import CreatePaymentDialog from "@/app/(protected)/payments/create-payment-dialog";

export default function InvoiceDetail() {
  const params = useParams()
  const invoiceId = params.invoiceId as string
  const router = useRouter()
  const { toast } = useToast()
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  
  // Use the new query that fetches invoice with items
  const { data: invoiceWithItems, isLoading, refetch } = useGetInvoiceWithItemsQuery(invoiceId)
  const [recordPayment, { isLoading: isRecordingPayment }] = useRecordPaymentMutation()
  
  const handleRecordPayment = async () => {
    if (paymentAmount <= 0) {
      toast({
        variant: "destructive",
        description: "Payment amount must be greater than zero"
      })
      return
    }
    
    if (paymentAmount > (invoiceWithItems?.result.dueAmount || 0)) {
      toast({
        variant: "destructive",
        description: "Payment amount cannot exceed the due amount"
      })
      return
    }
    
    try {
      await recordPayment({
        invoiceId,
        amount: paymentAmount
      }).unwrap()
      
      toast({
        description: "Payment recorded successfully"
      })
      
      setPaymentDialogOpen(false)
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to record payment"
      })
    }
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  if (isLoading) {
    return <Spinner />
  }
  
  if (!invoiceWithItems?.result) {
    return <div>Invoice not found</div>
  }
  
  const invoiceData = invoiceWithItems.result
  const items: IInvoiceItem[] = invoiceData.invoiceItems || []
  const bills: IBill[] = invoiceData.bills || []
  
  const recipientName = invoiceData.type === InvoiceType.PROVIDER 
    ? invoiceData.ReceiverProvider?.name 
    : invoiceData.ReceiverZone?.name
  
  return (
    <PageLoayout 
      title={`Invoice #${invoiceId.substring(0, 8)}`}
      buttons={[
        <Button key="back" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>,
        <Button key="print" variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>,
        <CreatePaymentDialog 
          key="payment" 
          preselectedInvoiceId={invoiceId} 
        />
      ]}
    >
      <div className="space-y-6">
        <div className="hidden print:block">
          <InvoiceTemplate invoice={invoiceData} items={items} bills={bills} />
        </div>
        
        <div className="print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Invoice Information</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-muted-foreground">Type:</span> {invoiceData.type}</p>
                    <p><span className="text-muted-foreground">Date:</span> {formatDate(invoiceData.createdAt)}</p>
                    <p><span className="text-muted-foreground">Invoice ID:</span> {invoiceData.id}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Recipient</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {recipientName || "Unknown Recipient"}</p>
                    <p><span className="text-muted-foreground">Type:</span> {invoiceData.type}</p>
                  </div>
                </div>
              </div>
              
              {/* Show Items if they exist */}
              {items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || 'Unknown Product'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{item.discountPercent}%</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              item.quantity * item.unitPrice * (1 - item.discountPercent / 100)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Show Bills if they exist */}
              {bills.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Bills</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.title}</TableCell>
                          <TableCell>{bill.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(bill.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Total Amount:</span>
                    <span>{formatCurrency(invoiceData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Paid Amount:</span>
                    <span>{formatCurrency(invoiceData.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-300">
                    <span className="font-medium">Due Amount:</span>
                    <span className="font-bold">{formatCurrency(invoiceData.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={invoiceData.dueAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Amount:</span>
              <span>{formatCurrency(invoiceData.dueAmount)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPayment} 
              disabled={isRecordingPayment || paymentAmount <= 0 || paymentAmount > invoiceData.dueAmount}
            >
              {isRecordingPayment ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-8">
        <InvoicePayments invoiceId={invoiceId} />
      </div>
    </PageLoayout>
  )
}
