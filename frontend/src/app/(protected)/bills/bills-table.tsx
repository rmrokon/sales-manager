"use client"
import { useState } from "react"
import { useGetBillsQuery, useDeleteBillMutation } from "@/store/services/bill"
import { IBill } from "@/utils/types/bill"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, isRtkQueryError } from "@/lib/utils"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { FilterConfig, FilterValues } from "@/components/ui/table-filters"
import { Edit, Trash, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import EditBillDialog from "./edit-bill-dialog"

export default function BillsTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterValues, setFilterValues] = useState<FilterValues>({});
    const [editingBill, setEditingBill] = useState<IBill | null>(null);
    
    const { data: billsData, isLoading, error } = useGetBillsQuery();
    const [deleteBill] = useDeleteBillMutation();
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (bill: IBill) => {
        if (!confirm(`Are you sure you want to delete the bill "${bill.title}"?`)) {
            return;
        }

        try {
            await deleteBill(bill.id).unwrap();
            toast({
                description: "Bill deleted successfully"
            });
        } catch (error) {
            console.error('Delete bill error:', error);
            toast({
                variant: "destructive",
                description: "Failed to delete bill"
            });
        }
    };

    const handleView = (bill: IBill) => {
        router.push(`/bills/${bill.id}`);
    };

    const columns: SimpleColumn<IBill>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (value, bill) => bill.title
        },
        {
            key: 'description',
            header: 'Description',
            render: (value, bill) => bill.description || '-'
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (value, bill) => formatCurrency(bill.amount)
        },
        {
            key: 'invoiceId',
            header: 'Invoice',
            render: (value, bill) => bill.invoiceId ? `#${bill.invoiceId.substring(0, 8)}` : '-'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (value, bill) => formatDate(bill.createdAt)
        }
    ];

    const actions: ActionButton<IBill>[] = [
        {
            type: "view",
            icon: <Eye className="h-4 w-4" />,
            onClick: handleView,
            variant: "ghost",
            tooltip: "View bill"
        },
        {
            type: "edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: (bill) => setEditingBill(bill),
            variant: "ghost",
            tooltip: "Edit bill"
        },
        {
            type: "delete",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "ghost",
            className: "text-destructive hover:text-destructive",
            tooltip: "Delete bill",
            confirmMessage: "Are you sure you want to delete this bill?"
        }
    ];

    const filterConfigs: FilterConfig[] = [
        {
            key: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Search by title...'
        }
    ];

    // Apply filters to the data
    const filteredData = billsData?.filter((bill: IBill) => {
        if (filterValues.title && !bill.title.toLowerCase().includes(filterValues.title.toLowerCase())) {
            return false;
        }
        return true;
    }) || [];

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">Failed to load bills</p>
            </div>
        );
    }

    return (
        <>
            <DataTable<IBill>
                data={paginatedData}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                keyExtractor={(bill) => bill.id.toString()}
                pagination={true}
                emptyMessage="No bills found"
            />
            
            {editingBill && (
                <EditBillDialog
                    bill={editingBill}
                    open={!!editingBill}
                    onOpenChange={(open) => !open && setEditingBill(null)}
                />
            )}
        </>
    );
}
