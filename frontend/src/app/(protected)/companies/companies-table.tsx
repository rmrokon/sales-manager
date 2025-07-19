import { useGetCompaniesQuery } from "@/store/services/company"
import { ICompany } from "@/utils/types/company"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { Trash } from "lucide-react"


export default function CompaniesTable() {
    const { data, isLoading } = useGetCompaniesQuery({});

    const columns: SimpleColumn<ICompany>[] = [
        {
            key: 'name',
            header: 'Name',
            className: 'font-medium'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (value) => new Date(value as string).toLocaleDateString()
        }
    ];

    const actions: ActionButton<ICompany>[] = [
        {
            type: 'delete',
            icon: <Trash className="h-4 w-4" />,
            onClick: (company) => {
                // TODO: Implement delete functionality
                console.log('Delete company:', company.id);
            },
            confirmMessage: "Are you sure you want to delete this company?"
        }
    ];

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            keyExtractor={(company) => company.id}
            emptyMessage="No companies found"
        />
    )
}