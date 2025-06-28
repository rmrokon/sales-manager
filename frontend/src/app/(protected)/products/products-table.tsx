import { useState } from "react"
import { useGetProductsQuery, useDeleteProductMutation } from "@/store/services/product"
import { IProduct } from "@/utils/types/product"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError, formatCurrency } from "@/lib/utils"
import EditProductDialog from "./edit-product-dialog"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"

export default function ProductsTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterValues, setFilterValues] = useState<FilterValues>({});

    // Transform filter values for API
    const getApiFilters = () => {
        const apiFilters: Record<string, any> = {};

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

    const { data, isLoading } = useGetProductsQuery({
        page: currentPage,
        limit: pageSize,
        ...getApiFilters()
    });
    const [deleteProduct] = useDeleteProductMutation();
    const { toast } = useToast();

    const handleDelete = async (product: IProduct) => {
        const result = await deleteProduct(product.id);
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            toast({
                description: "Product deleted successfully"
            });
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
            placeholder: 'Search products...'
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

    const columns: SimpleColumn<IProduct>[] = [
        {
            key: 'name',
            header: 'Name',
            className: 'font-medium'
        },
        {
            key: 'price',
            header: 'Price',
            render: (value) => formatCurrency(value as number)
        },
        {
            key: 'description',
            header: 'Description',
            render: (value) => String(value || '-')
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (value) => new Date(value as string).toLocaleDateString()
        }
    ];

    const actions: ActionButton<IProduct>[] = [
        {
            type: 'delete',
            onClick: handleDelete,
            confirmMessage: "Are you sure you want to delete this product?",
            tooltip: 'Delete product',
            variant: 'destructive'
        }
    ];

    // Custom render function for actions that includes the EditProductDialog
    const renderCustomActions = (product: IProduct) => (
        <EditProductDialog product={product} />
    );

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            customActions={renderCustomActions}
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
    );
}