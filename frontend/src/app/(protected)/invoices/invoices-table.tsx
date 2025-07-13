"use client"
import { useState } from "react"
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from "@/store/services/invoice"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, isRtkQueryError } from "@/lib/utils"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"

export default function InvoicesTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterValues, setFilterValues] = useState<FilterValues>({});

    // Transform filter values for API
    const getApiFilters = () => {
        const apiFilters: Record<string, unknown> = {};

        Object.entries(filterValues).forEach(([key, value]) => {
            if (key === 'dateRange' && value?.from) {
                // Use local date string to avoid timezone issues
                const fromDate = new Date(value.from);
                apiFilters.dateFrom = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
                if (value.to) {
                    const toDate = new Date(value.to);
                    apiFilters.dateTo = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
                }
            } else if (key === 'date' && value) {
                // Use local date string to avoid timezone issues
                const date = new Date(value);
                apiFilters.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (value !== undefined && value !== null && value !== '') {
                apiFilters[key] = value;
            }
        });

        return apiFilters;
    };

    const { data, isLoading, refetch } = useGetInvoicesQuery({
        page: currentPage,
        limit: pageSize,
        ...getApiFilters()
    });
    const [deleteInvoice] = useDeleteInvoiceMutation();
    const { toast } = useToast();

    const handleDelete = async (invoice: IInvoice) => {
        const result = await deleteInvoice(invoice.id);
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            toast({
                description: "Invoice deleted successfully"
            });
            refetch();
        }
    };

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilterValues(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Filter configuration
    const filters: FilterConfig[] = [
        {
            type: 'text',
            key: 'search',
            label: 'Search',
            placeholder: 'Search invoices...'
        },
        {
            type: 'select',
            key: 'type',
            label: 'Type',
            options: [
                { value: InvoiceType.PROVIDER, label: 'Provider' },
                { value: InvoiceType.ZONE, label: 'Zone' }
            ],
            placeholder: 'Select type'
        },
        {
            type: 'date',
            key: 'date',
            label: 'Invoice Date',
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
            key: 'invoiceNumber',
            header: 'Invoice Number',
            className: 'font-medium',
            render: (value) => (
                <span className="font-mono text-sm bg-foreground text-background px-2 py-1 rounded">
                    {String(value)}
                </span>
            )
        },
        {
            key: 'type',
            header: 'Type',
            className: 'capitalize',
            render: (value) => String(value)
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
                if (invoice.type === InvoiceType.COMPANY) {
                    return "Company (Internal)";
                }
                return "Unknown";
            }
        },
        {
            key: 'totalAmount',
            header: 'Total Amount',
            render: (value) => formatCurrency(value as number)
        },
        {
            key: 'paidAmount',
            header: 'Paid Amount',
            render: (value) => formatCurrency(value as number)
        },
        {
            key: 'dueAmount',
            header: 'Due Amount',
            render: (value) => formatCurrency(value as number)
        },
        {
            key: 'invoiceDate',
            header: 'Invoice Date',
            render: (value) => new Date(value as string).toLocaleDateString()
        }
    ];

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
            onClick: handleDelete,
            confirmMessage: "Are you sure you want to delete this invoice?",
            tooltip: 'Delete invoice'
        }
    ];

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            keyExtractor={(invoice) => invoice.id}
            emptyMessage="No invoices found"
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
    );
}
