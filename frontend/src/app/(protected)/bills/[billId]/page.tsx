"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoayout } from "@/components"
import { useGetBillByIdQuery } from "@/store/services/bill"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"
import EditBillDialog from "../edit-bill-dialog"

export default function BillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const billId = params.billId as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const { data: billData, isLoading, error } = useGetBillByIdQuery(billId)
  
  if (isLoading) {
    return (
      <PageLoayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PageLoayout>
    )
  }
  
  if (error || !billData) {
    return (
      <PageLoayout title="Bill Not Found">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Bill not found or failed to load</p>
          <Button onClick={() => router.push('/bills')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bills
          </Button>
        </div>
      </PageLoayout>
    )
  }
  
  const bill = billData
  
  return (
    <PageLoayout 
      title={`Bill: ${bill.title}`}
      buttons={[
        <Button key="back" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>,
        <Button key="edit" onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Bill
        </Button>
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-lg">{bill.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-lg font-semibold">{formatCurrency(bill.amount)}</p>
              </div>
              
              {bill.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{bill.description}</p>
                </div>
              )}
              
              {bill.invoiceId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice ID</label>
                  <p className="text-base">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => router.push(`/invoices/${bill.invoiceId}`)}
                    >
                      #{bill.invoiceId.substring(0, 8)}
                    </Button>
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-base">{formatDate(bill.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-base">{formatDate(bill.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isEditDialogOpen && (
        <EditBillDialog
          bill={bill}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </PageLoayout>
  )
}
