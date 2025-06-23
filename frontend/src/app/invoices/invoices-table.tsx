"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash } from "lucide-react"
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from "@/store/services/invoice"
import { IInvoice, InvoiceType } from "@/utils/types/invoice"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, isRtkQueryError } from "@/lib/utils"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"

export default function InvoicesTable() {
    const { data, isLoading, refetch } = useGetInvoicesQuery({});
    const [deleteInvoice] = useDeleteInvoiceMutation();
    const { toast } = useToast();

    if(isLoading) return <Spinner />;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this invoice?")) {
            const result = await deleteInvoice(id);
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
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data?.result.map((invoice: IInvoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium truncate max-w-[100px]">{invoice.id}</TableCell>
                            <TableCell className="capitalize">{invoice.type}</TableCell>
                            <TableCell>
                                {invoice.type === InvoiceType.PROVIDER && invoice.ReceiverProvider
                                    ? invoice.ReceiverProvider.name
                                    : invoice.type === InvoiceType.ZONE && invoice.ReceiverZone
                                        ? invoice.ReceiverZone.name
                                        : "Unknown"}
                            </TableCell>
                            <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                            <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                            <TableCell>{formatCurrency(invoice.dueAmount)}</TableCell>
                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <Link href={`/invoices/${invoice.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/invoices/${invoice.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(invoice.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
}
