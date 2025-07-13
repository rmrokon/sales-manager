import { useGetProvidersQuery, useDeleteProviderMutation } from "@/store/services/provider"
import { IProvider } from "@/utils/types/provider"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import EditProviderDialog from "./edit-provider-dialog"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { Trash } from "lucide-react"

export default function ProvidersTable() {
    const { data, isLoading } = useGetProvidersQuery({});
    const [deleteProvider] = useDeleteProviderMutation();
    const { toast } = useToast();

    const handleDelete = async (provider: IProvider) => {
        const result = await deleteProvider(provider.id);
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            toast({
                description: "Provider deleted successfully"
            });
        }
    };

    const columns: SimpleColumn<IProvider>[] = [
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

    const actions: ActionButton<IProvider>[] = [
        {
            type: 'delete',
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            confirmMessage: "Are you sure you want to delete this provider?"
        }
    ];

    return (
        <DataTable
            data={data?.result || []}
            columns={columns}
            actions={actions}
            customActions={(provider) => <EditProviderDialog provider={provider} />}
            isLoading={isLoading}
            keyExtractor={(provider) => provider.id}
            emptyMessage="No providers found"
        />
    )
}