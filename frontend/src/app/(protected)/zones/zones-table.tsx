import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"
import { useGetZonesQuery, useDeleteZoneMutation } from "@/store/services/zone"
import { Zone } from "@/store/services/zone"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import EditZoneDialog from "./edit-zone-dialog"
import { Spinner } from "@/components/ui/spinner"

export default function ZonesTable() {
    const { data, isLoading } = useGetZonesQuery({});
    const [deleteZone] = useDeleteZoneMutation();
    const { toast } = useToast();

    if(isLoading) return <Spinner />;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this zone?")) {
            const result = await deleteZone(id);
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
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="">Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data?.map((zone: Zone) => (
                        <TableRow key={zone.id}>
                            <TableCell className="font-medium">{zone.name}</TableCell>
                            <TableCell>{new Date(zone.createdAt!).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <EditZoneDialog zone={zone} />
                                    <Button 
                                        variant="destructive" 
                                        size="icon"
                                        onClick={() => handleDelete(zone.id)}
                                    >
                                        <Delete />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}
