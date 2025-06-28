"use client"

import * as React from "react"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { formatCurrency } from "@/lib/utils"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"

// Example 1: Client-side pagination (data is paginated in the browser)
export function ClientSidePaginationExample({ 
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
      keyExtractor={(invoice) => invoice.id}
      pagination={true}
      pageSize={5}
      emptyMessage="No invoices found"
    />
  )
}

// Example 2: Server-side pagination (data is paginated on the server)
export function ServerSidePaginationExample({ 
  invoices, 
  isLoading, 
  onDelete,
  currentPage,
  totalItems,
  onPageChange
}: {
  invoices: IInvoice[]
  isLoading: boolean
  onDelete: (invoice: IInvoice) => void
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
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
      key: 'recipient',
      header: 'Recipient',
      render: (_, invoice) => {
        if (invoice.type === InvoiceType.PROVIDER && invoice.ReceiverProvider) {
          return invoice.ReceiverProvider.name;
        }
        if (invoice.type === InvoiceType.ZONE && invoice.ReceiverZone) {
          return invoice.ReceiverZone.name;
        }
        return "Unknown";
      }
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'dueAmount',
      header: 'Due Amount',
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
      href: (invoice) => `/invoices/${invoice.id}`,
      tooltip: 'View invoice'
    },
    {
      type: 'edit',
      href: (invoice) => `/invoices/${invoice.id}/edit`,
      tooltip: 'Edit invoice'
    },
    {
      type: 'delete',
      onClick: onDelete,
      confirmMessage: "Are you sure you want to delete this invoice?",
      tooltip: 'Delete invoice'
    }
  ]

  return (
    <DataTable
      data={invoices}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      keyExtractor={(invoice) => invoice.id}
      pagination={true}
      pageSize={10}
      currentPage={currentPage}
      totalItems={totalItems}
      onPageChange={onPageChange}
      emptyMessage="No invoices found"
    />
  )
}

// Example 3: Table without pagination
export function NoPaginationExample({ 
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
    }
  ]

  const actions: ActionButton<IInvoice>[] = [
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
      keyExtractor={(invoice) => invoice.id}
      pagination={false} // No pagination
      emptyMessage="No invoices found"
    />
  )
}

// Example 4: Custom page size
export function CustomPageSizeExample({ 
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
      keyExtractor={(invoice) => invoice.id}
      pagination={true}
      pageSize={25} // Show 25 items per page
      emptyMessage="No invoices found"
    />
  )
}

// Example usage in a real component:

// Real-world example: Invoices page with server-side pagination
export function InvoicesPageExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  // API call with pagination parameters
  // const { data, isLoading } = useGetInvoicesQuery({
  //   page: currentPage,
  //   limit: pageSize
  // })
  const data = { result: [], pagination: { total: 0 } };
  const isLoading = false;

  const handleDelete = async (invoice: IInvoice) => {
    // Delete logic here
    console.log('Deleting invoice:', invoice.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="text-sm text-muted-foreground">
          {data?.pagination && (
            `Page ${data.pagination.page} of ${data.pagination.pages_count}
             (${data.pagination.total} total items)`
          )}
        </div>
      </div>

      <DataTable
        data={data?.result || []}
        columns={[
          { key: 'id', header: 'ID', className: 'font-medium truncate max-w-[100px]' },
          { key: 'type', header: 'Type', className: 'capitalize' },
          { key: 'totalAmount', header: 'Total', render: (value) => formatCurrency(value) },
          { key: 'createdAt', header: 'Created', render: (value) => new Date(value).toLocaleDateString() }
        ]}
        actions={[
          { type: 'view', href: (invoice) => `/invoices/${invoice.id}` },
          { type: 'edit', href: (invoice) => `/invoices/${invoice.id}/edit` },
          { type: 'delete', onClick: handleDelete, confirmMessage: "Are you sure?" }
        ]}
        isLoading={isLoading}
        keyExtractor={(invoice) => invoice.id}
        pagination={true}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={data?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        emptyMessage="No invoices found"
      />
    </div>
  )
}

// Real-world example: Products page with server-side pagination
export function ProductsPageExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(15)

  // const { data, isLoading } = useGetProductsQuery({
  //   page: currentPage,
  //   limit: pageSize
  // })
  const data = { result: [], pagination: { total: 0 } };
  const isLoading = false;

  const handleDelete = async (product: any) => {
    console.log('Deleting product:', product.id)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>

      <DataTable
        data={data?.result || []}
        columns={[
          { key: 'name', header: 'Name', className: 'font-medium' },
          { key: 'price', header: 'Price', render: (value) => formatCurrency(value) },
          { key: 'description', header: 'Description', render: (value) => value || '-' },
          { key: 'createdAt', header: 'Created', render: (value) => new Date(value).toLocaleDateString() }
        ]}
        actions={[
          { type: 'edit', onClick: () => {}, tooltip: 'Edit product' },
          { type: 'delete', onClick: handleDelete, confirmMessage: "Are you sure?" }
        ]}
        isLoading={isLoading}
        keyExtractor={(product) => product.id}
        pagination={true}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={data?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        emptyMessage="No products found"
      />
    </div>
  )
}
