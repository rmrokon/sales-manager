"use client"

import * as React from "react"
import { useState } from "react"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"
import { formatCurrency } from "@/lib/utils"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"

// Example 1: Invoice table with comprehensive filtering
export function FilteredInvoicesExample({ 
  useGetInvoicesQuery,
  useDeleteInvoiceMutation 
}: {
  useGetInvoicesQuery: any
  useDeleteInvoiceMutation: any
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  
  // Transform filter values for API
  const getApiFilters = () => {
    const apiFilters: Record<string, any> = {};
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (key === 'dateRange' && value?.from) {
        apiFilters.dateFrom = value.from.toISOString().split('T')[0];
        if (value.to) {
          apiFilters.dateTo = value.to.toISOString().split('T')[0];
        }
      } else if (key === 'date' && value) {
        apiFilters.date = value.toISOString().split('T')[0];
      } else if (value !== undefined && value !== null && value !== '') {
        apiFilters[key] = value;
      }
    });
    
    return apiFilters;
  };

  const { data, isLoading } = useGetInvoicesQuery({
    page: currentPage,
    limit: pageSize,
    ...getApiFilters()
  });

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const handleDelete = async (invoice: IInvoice) => {
    await deleteInvoice(invoice.id);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Comprehensive filter configuration
  const filters: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search',
      placeholder: 'Search invoices, providers, zones...'
    },
    {
      type: 'select',
      key: 'type',
      label: 'Invoice Type',
      options: [
        { value: InvoiceType.PROVIDER, label: 'Provider Invoice' },
        { value: InvoiceType.ZONE, label: 'Zone Invoice' }
      ],
      placeholder: 'All types'
    },
    {
      type: 'select',
      key: 'status',
      label: 'Payment Status',
      options: [
        { value: 'paid', label: 'Fully Paid' },
        { value: 'partial', label: 'Partially Paid' },
        { value: 'unpaid', label: 'Unpaid' }
      ],
      placeholder: 'All statuses'
    },
    {
      type: 'date',
      key: 'date',
      label: 'Created Date',
      mode: 'single'
    },
    {
      type: 'date',
      key: 'dateRange',
      label: 'Date Range',
      mode: 'range'
    }
  ];

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
      key: 'dueAmount',
      header: 'Due Amount',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: ActionButton<IInvoice>[] = [
    {
      type: 'view',
      href: (invoice) => `/invoices/${invoice.id}`,
      tooltip: 'View invoice details'
    },
    {
      type: 'edit',
      href: (invoice) => `/invoices/${invoice.id}/edit`,
      tooltip: 'Edit invoice'
    },
    {
      type: 'delete',
      onClick: handleDelete,
      confirmMessage: "Are you sure you want to delete this invoice?",
      tooltip: 'Delete invoice'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="text-sm text-muted-foreground">
          {data?.pagination && (
            `${data.pagination.total} total invoices`
          )}
        </div>
      </div>
      
      <DataTable
        data={data?.result || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        keyExtractor={(invoice) => invoice.id}
        emptyMessage="No invoices found matching your filters"
        pagination={true}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={data?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showFilters={true}
      />
    </div>
  );
}

// Example 2: Products table with simpler filtering
export function FilteredProductsExample({ 
  useGetProductsQuery,
  useDeleteProductMutation 
}: {
  useGetProductsQuery: any
  useDeleteProductMutation: any
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  
  const getApiFilters = () => {
    const apiFilters: Record<string, any> = {};
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (key === 'dateRange' && value?.from) {
        apiFilters.dateFrom = value.from.toISOString().split('T')[0];
        if (value.to) {
          apiFilters.dateTo = value.to.toISOString().split('T')[0];
        }
      } else if (key === 'date' && value) {
        apiFilters.date = value.toISOString().split('T')[0];
      } else if (value !== undefined && value !== null && value !== '') {
        apiFilters[key] = value;
      }
    });
    
    return apiFilters;
  };

  const { data, isLoading } = useGetProductsQuery({
    page: currentPage,
    limit: pageSize,
    ...getApiFilters()
  });

  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (product: any) => {
    await deleteProduct(product.id);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  // Simpler filter configuration for products
  const filters: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search Products',
      placeholder: 'Search by name or description...'
    },
    {
      type: 'date',
      key: 'dateRange',
      label: 'Created Date Range',
      mode: 'range'
    }
  ];

  const columns: SimpleColumn<any>[] = [
    {
      key: 'name',
      header: 'Product Name',
      className: 'font-medium'
    },
    {
      key: 'price',
      header: 'Price',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => value || '-'
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: ActionButton<any>[] = [
    {
      type: 'edit',
      onClick: () => {}, // Would open edit dialog
      tooltip: 'Edit product'
    },
    {
      type: 'delete',
      onClick: handleDelete,
      confirmMessage: "Are you sure you want to delete this product?",
      tooltip: 'Delete product'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Products</h2>
      
      <DataTable
        data={data?.result || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        keyExtractor={(product) => product.id}
        emptyMessage="No products found"
        pagination={true}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={data?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showFilters={true}
      />
    </div>
  );
}

// Example 3: Table with filters but no pagination
export function FilteredSimpleTableExample({ data }: { data: any[] }) {
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  
  // Client-side filtering for simple tables
  const filteredData = React.useMemo(() => {
    if (!filterValues.search) return data;
    
    return data.filter(item => 
      item.name?.toLowerCase().includes(filterValues.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filterValues.search.toLowerCase())
    );
  }, [data, filterValues.search]);

  const filters: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search',
      placeholder: 'Search items...'
    }
  ];

  const columns: SimpleColumn<any>[] = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' }
  ];

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      keyExtractor={(item) => item.id}
      pagination={false}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
      showFilters={true}
      emptyMessage="No items found matching your search"
    />
  );
}
