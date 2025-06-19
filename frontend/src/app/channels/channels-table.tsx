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
import { IChannel } from "@/utils/types/channel";
import { useDeleteChannelMutation, useGetChannelsQuery } from "@/store/services/channel";
import { useToast } from "@/hooks/use-toast";
import CreateUpdateChannelDialog from "./create-update-channel-dialog";


export default function ChannelsTable() {
    const {data, isLoading} = useGetChannelsQuery({});
    const [deleteChannelMutation, {isError, isLoading: deleteLoading}] = useDeleteChannelMutation();
    const {toast} = useToast();
    const handleDeleteChannel = async (id: string) => {
        const result = await deleteChannelMutation({id});
        if (isError) {
            toast({
                variant: "destructive",
                description: `Error deleting channel`
            });
            console.log(result);
        }
    }
    
    if(isLoading || deleteLoading) return <h3>Loading...</h3>;
    return (
        <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
                <TableRow>
                    <TableHead className="">Channel Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data?.result.map((channel: IChannel) => (
                        <TableRow key={channel.id}>
                            <TableCell className="font-medium">{channel.name}</TableCell>
                            <TableCell>{new Date(channel.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="w-full flex items-center justify-center gap-4">
                                 <CreateUpdateChannelDialog defaultValues={channel} />
                                <Button onClick={()=>handleDeleteChannel(channel?.id)} variant="destructive" size="icon">
                                    <Delete />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}