import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Delete, Edit } from "lucide-react"
import { useGetProvidersQuery, useDeleteProviderMutation } from "@/store/services/provider"
import { IProvider } from "@/utils/types/provider"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import EditProviderDialog from "./edit-provider-dialog"

export default function ProvidersTable() {
    const { data, isLoading } = useGetProvidersQuery({});
    const [deleteProvider] = useDeleteProviderMutation();
    const { toast } = useToast();

    if(isLoading) return <h3>Loading...</h3>;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this provider?")) {
            const result = await deleteProvider(id);
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
                    data?.result.map((provider: IProvider) => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium">{provider.name}</TableCell>
                            <TableCell>{new Date(provider.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <EditProviderDialog provider={provider} />
                                    <Button 
                                        variant="destructive" 
                                        size="icon"
                                        onClick={() => handleDelete(provider.id)}
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