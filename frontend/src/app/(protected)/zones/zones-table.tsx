import { useGetZonesQuery, useDeleteZoneMutation } from "@/store/services/zone"
import { Zone } from "@/store/services/zone"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import EditZoneDialog from "./edit-zone-dialog"
import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { Trash } from "lucide-react"

export default function ZonesTable() {
    const { data, isLoading } = useGetZonesQuery({});
    const [deleteZone] = useDeleteZoneMutation();
    const { toast } = useToast();

    const handleDelete = async (zone: Zone) => {
        const result = await deleteZone(zone.id);
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            toast({
                description: "Zone deleted successfully"
            });
        }
    };

    const columns: SimpleColumn<Zone>[] = [
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

    const actions: ActionButton<Zone>[] = [
        {
            type: 'delete',
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            confirmMessage: "Are you sure you want to delete this zone?"
        }
    ];

    return (
        <DataTable
            data={data || []}
            columns={columns}
            actions={actions}
            customActions={(zone) => <EditZoneDialog zone={zone} />}
            isLoading={isLoading}
            keyExtractor={(zone) => zone.id}
            emptyMessage="No zones found"
        />
    )
}
