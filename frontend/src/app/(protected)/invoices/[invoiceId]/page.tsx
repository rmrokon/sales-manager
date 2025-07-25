"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoayout } from "@/components"
import { useGetInvoiceWithItemsQuery, useRecordPaymentMutation } from "@/store/services/invoice"
import { useGetPaymentsQuery } from "@/store/services/payment"
import { useGetReturnsByInvoiceQuery } from "@/store/services/returns-api"
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
import { ReturnStatus } from "@/utils/types/returns"

export default function InvoiceDetail() {
  const params = useParams()
  const invoiceId = params.invoiceId as string
  const router = useRouter()
  const { toast } = useToast()
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  
  // Use the new query that fetches invoice with items
  const { data: invoiceWithItems, isLoading, refetch } = useGetInvoiceWithItemsQuery(invoiceId)
  const { data: payments } = useGetPaymentsQuery({ invoiceId })
  const { data: returns } = useGetReturnsByInvoiceQuery(invoiceId)
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

  console.log({invoiceWithItems});
  
  const invoiceData = invoiceWithItems.result
  const items: IInvoiceItem[] = invoiceData.invoiceItems || []
  const bills: IBill[] = invoiceData.bills || []

  // Calculate effective amounts considering payments and returns
  const totalPayments = (payments || [])?.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const totalReturns = (returns?.result || [])
    ?.filter(returnItem => returnItem.status === ReturnStatus.APPROVED) // Only count approved returns
    ?.reduce((sum, returnItem) => sum + (returnItem.totalReturnAmount || 0), 0)
  const effectiveOutstanding = invoiceData.totalAmount - totalPayments - totalReturns

  const recipientName = invoiceData.type === InvoiceType.PROVIDER
    ? invoiceData.ReceiverProvider?.name
    : invoiceData.type === InvoiceType.ZONE
    ? invoiceData.ReceiverZone?.name
    : "Company (Internal)"
  
  return (
    <PageLoayout
      title={`Invoice ${invoiceData.invoiceNumber}`}
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
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Details</span>
                <span className="font-mono text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {invoiceData.invoiceNumber}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Invoice Information</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-muted-foreground">Invoice Number:</span>
                      <span className="font-mono ml-2 bg-foreground text-background px-2 py-1 rounded text-sm">
                        {invoiceData.invoiceNumber}
                      </span>
                    </p>
                    <p><span className="text-muted-foreground">Type:</span> {invoiceData.type}</p>
                    <p><span className="text-muted-foreground">Date:</span> {formatDate(invoiceData.createdAt)}</p>
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
                <div className="w-80">
                  {/* Calculate subtotal before discount */}
                  {(() => {
                    const subtotal = items.reduce((sum, item) =>
                      sum + (item.quantity * item.unitPrice * (1 - item.discountPercent / 100)), 0
                    ) + bills.reduce((sum, bill) => sum + bill.amount, 0);

                    const hasDiscount = invoiceData.discountValue && invoiceData.discountValue > 0;
                    const discountAmount = hasDiscount ? (
                      invoiceData.discountType === 'percentage'
                        ? (subtotal * invoiceData.discountValue) / 100
                        : invoiceData.discountValue
                    ) : 0;

                    return (
                      <>
                        {hasDiscount && (
                          <>
                            <div className="flex justify-between py-2">
                              <span className="font-medium">Subtotal:</span>
                              <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-orange-600">
                              <span className="font-medium">
                                Discount ({invoiceData.discountType === 'percentage' ? `${invoiceData.discountValue}%` : 'Amount'}):
                              </span>
                              <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-200">
                              <span className="font-medium">Total After Discount:</span>
                              <span>{formatCurrency(invoiceData.totalAmount)}</span>
                            </div>
                          </>
                        )}
                        {!hasDiscount && (
                          <div className="flex justify-between py-2">
                            <span className="font-medium">Total Amount:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="flex justify-between py-2 text-green-600">
                    <span className="font-medium">Total Payments:</span>
                    <span>-{formatCurrency(totalPayments)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-blue-600">
                    <span className="font-medium">Total Returns:</span>
                    <span>-{formatCurrency(totalReturns)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-300">
                    <span className="font-medium">Outstanding Balance:</span>
                    <span className={`font-bold ${effectiveOutstanding > 0 ? 'text-red-600' : effectiveOutstanding < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {formatCurrency(Math.abs(effectiveOutstanding))}
                      {effectiveOutstanding < 0 && ' (Credit)'}
                    </span>
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
