"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { formatCurrency } from "@/lib/utils"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"
import { Eye, Pencil, Trash, ArrowUpDown } from "lucide-react"

// Example 1: Using DataTable for simple cases
export function SimpleInvoiceTable({ 
  invoices, 
  isLoading, 
  onDelete 
}: {
  invoices: IInvoice[]
  isLoading: boolean
  onDelete: (invoice: IInvoice) => void
}) {
  const columns: SimpleColumn<IInvoice>[] = [
    {
      key: 'id',
      header: 'ID',
      className: 'font-medium truncate max-w-[100px]'
    },
    {
      key: 'type',
      header: 'Type',
      className: 'capitalize'
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  const actions: ActionButton<IInvoice>[] = [
    {
      type: 'view',
      href: (invoice) => `/invoices/${invoice.id}`
    },
    {
      type: 'edit',
      href: (invoice) => `/invoices/${invoice.id}/edit`
    },
    {
      type: 'delete',
      onClick: onDelete,
      confirmMessage: "Are you sure you want to delete this invoice?"
    }
  ]

  return (
    <DataTable
      data={invoices}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      keyExtractor={(invoice: IInvoice) => invoice.id}
    />
  )
}

// Example 2: Using DataTable for advanced features (sorting, filtering, pagination)
export function AdvancedInvoiceTable({ 
  invoices, 
  isLoading, 
  onDelete 
}: {
  invoices: IInvoice[]
  isLoading: boolean
  onDelete: (invoice: IInvoice) => void
}) {
  const columns: ColumnDef<IInvoice>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[100px]">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      id: "recipient",
      header: "Recipient",
      cell: ({ row }) => {
        const invoice = row.original
        if (invoice.type === InvoiceType.PROVIDER && invoice.ReceiverProvider) {
          return invoice.ReceiverProvider.name
        }
        if (invoice.type === InvoiceType.ZONE && invoice.ReceiverZone) {
          return invoice.ReceiverZone.name
        }
        return "Unknown"
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"))
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("paidAmount"))
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: "dueAmount",
      header: "Due Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("dueAmount"))
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString()
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invoice = row.original

        return (
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href={`/invoices/${invoice.id}`}>
                <Eye className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href={`/invoices/${invoice.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this invoice?")) {
                  onDelete(invoice)
                }
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      searchKey="id"
      searchPlaceholder="Search invoices..."
      pagination={true}
    />
  )
}

// Example 3: Custom table with row selection and bulk actions
export function SelectableInvoiceTable({ 
  invoices, 
  isLoading,
  onBulkDelete
}: {
  invoices: IInvoice[]
  isLoading: boolean
  onBulkDelete: (invoices: IInvoice[]) => void
}) {
  // This would require extending the DataTable component to support selection
  // For now, this is a placeholder showing how it could be structured
  
  const columns: SimpleColumn<IInvoice>[] = [
    {
      key: 'id',
      header: 'ID',
      className: 'font-medium truncate max-w-[100px]'
    },
    {
      key: 'type',
      header: 'Type',
      className: 'capitalize'
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value) => formatCurrency(value)
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <Button 
          variant="destructive" 
          onClick={() => onBulkDelete([])}
          disabled={true} // Would be enabled when items are selected
        >
          Delete Selected
        </Button>
      </div>
      <DataTable
        data={invoices}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(invoice: IInvoice) => invoice.id}
        showActions={false} // Hide individual actions for bulk operations
      />
    </div>
  )
}
