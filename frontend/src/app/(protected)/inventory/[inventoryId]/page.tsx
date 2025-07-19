"use client"
import { useParams } from "next/navigation"
import { useGetInventoryByIdQuery, useGetInventoryTransactionsQuery } from "@/store/services/inventory-api"
import { PageLoayout } from "@/components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { DataTable, SimpleColumn } from "@/components/ui/reusable-table"
import { InventoryTransaction } from "@/store/services/inventory-api"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InventoryDetailPage() {
  const params = useParams()
  const inventoryId = params.inventoryId as string

  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventoryByIdQuery(inventoryId)
  const { data: transactionsData, isLoading: transactionsLoading } = useGetInventoryTransactionsQuery({
    productId: inventoryData?.productId,
    limit: 50
  })

  const inventory = inventoryData
  const transactions = transactionsData?.result || []

  // Transaction table columns
  const transactionColumns: SimpleColumn<InventoryTransaction>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => new Date(value as string).toLocaleDateString()
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <Badge 
          variant={
            value === 'PURCHASE' ? 'default' :
            value === 'DISTRIBUTION' ? 'secondary' : 'outline'
          }
        >
          {String(value)}
        </Badge>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (value, transaction) => (
        <span className={transaction.type === 'DISTRIBUTION' ? 'text-red-600' : 'text-green-600'}>
          {transaction.type === 'DISTRIBUTION' ? '-' : '+'}{String(value)}
        </span>
      )
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (value) => formatCurrency(Number(value))
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value) => formatCurrency(Number(value))
    },
    {
      key: 'referenceType',
      header: 'Reference',
      render: (value, transaction) => (
        <div className="text-sm">
          <div>{String(value || 'N/A')}</div>
          {transaction.referenceId && (
            <div className="text-muted-foreground truncate max-w-[100px]">
              {transaction.referenceId}
            </div>
          )}
        </div>
      )
    }
  ]

  if (inventoryLoading) {
    return (
      <PageLoayout title="Loading...">
        <div>Loading inventory details...</div>
      </PageLoayout>
    )
  }

  if (!inventory) {
    return (
      <PageLoayout title="Not Found">
        <div>Inventory item not found</div>
      </PageLoayout>
    )
  }

  return (
    <PageLoayout 
      title={`Inventory: ${inventory.product?.name || 'Unknown Product'}`}
      buttons={[
        <Link key="back" href="/inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      ]}
    >
      {/* Inventory Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {inventory.product?.name}
            </div>
            <div>
              <span className="font-medium">SKU:</span> {inventory.product?.sku || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {inventory.product?.description || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Current Quantity:</span>{' '}
              <Badge variant={inventory.quantity < 10 ? 'destructive' : inventory.quantity < 50 ? 'secondary' : 'default'}>
                {inventory.quantity}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Unit Price:</span> {formatCurrency(inventory.unitPrice)}
            </div>
            <div>
              <span className="font-medium">Total Value:</span> {formatCurrency(inventory.totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Provider:</span> {inventory.provider?.name || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(inventory.updatedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Created:</span> {new Date(inventory.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All inventory movements for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={transactionColumns}
            isLoading={transactionsLoading}
            keyExtractor={(transaction) => transaction.id}
            emptyMessage="No transactions found"
            // showPagination={false}
            pagination={false}
          />
        </CardContent>
      </Card>
    </PageLoayout>
  )
}
