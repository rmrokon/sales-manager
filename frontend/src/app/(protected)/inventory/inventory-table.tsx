"use client"
import { useState } from "react"
import { useGetInventoryQuery } from "@/store/services/inventory-api"
import { useGetProvidersQuery } from "@/store/services/provider"
import { InventoryItem } from "@/store/services/inventory-api"
import { IProvider } from "@/utils/types/provider"
import { formatCurrency } from "@/lib/utils"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"
import { Badge } from "@/components/ui/badge"

export default function InventoryTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterValues, setFilterValues] = useState<FilterValues>({});

    // Get providers for filter options
    const { data: providersData } = useGetProvidersQuery({});

    // Transform filter values for API
    const getApiFilters = () => {
        const apiFilters: Record<string, unknown> = {};

        Object.entries(filterValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                apiFilters[key] = value;
            }
        });

        return apiFilters;
    };

    const { data, isLoading } = useGetInventoryQuery({
        page: currentPage,
        limit: pageSize,
        ...getApiFilters()
    });

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
            placeholder: 'Search products...'
        },
        {
            type: 'select',
            key: 'providerId',
            label: 'Provider',
            options: providersData?.result?.map((provider: IProvider) => ({
                value: provider.id,
                label: provider.name
            })) || [],
            placeholder: 'Select provider'
        },
        // {
        //     type: 'select',
        //     key: 'lowStock',
        //     label: 'Stock Level',
        //     options: [
        //         { value: 'true', label: 'Low Stock Only' },
        //         { value: 'false', label: 'All Items' }
        //     ],
        //     placeholder: 'Select stock level'
        // }
    ];

    const columns: SimpleColumn<InventoryItem>[] = [
        {
            key: 'product.name',
            header: 'Product',
            render: (_, item) => (
                <div>
                    <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                    <div className="text-sm text-muted-foreground">{item.product?.id || 'N/A'}</div>
                </div>
            )
        },
        {
            key: 'provider.name',
            header: 'Provider',
            render: (_, item) => item.provider?.name || 'Unknown Provider'
        },
        {
            key: 'quantity',
            header: 'Quantity',
            render: (value) => (
                <Badge variant={Number(value) < 10 ? 'destructive' : Number(value) < 50 ? 'secondary' : 'default'}>
                    {String(value)}
                </Badge>
            )
        },
        {
            key: 'unitPrice',
            header: 'Unit Price',
            render: (value) => formatCurrency(Number(value))
        },
        {
            key: 'totalValue',
            header: 'Total Value',
            render: (value) => formatCurrency(Number(value))
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            render: (value) => new Date(value as string).toLocaleDateString()
        }
    ];

    const actions: ActionButton<InventoryItem>[] = [
        {
            type: 'view',
            href: (item) => `/inventory/${item.id}`,
            tooltip: 'View inventory details'
        }
    ];

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            keyExtractor={(item) => item.id}
            emptyMessage="No inventory items found"
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
