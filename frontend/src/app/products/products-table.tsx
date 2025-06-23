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
import { useGetProductsQuery, useDeleteProductMutation } from "@/store/services/product"
import { IProduct } from "@/utils/types/product"
import { useToast } from "@/hooks/use-toast"
import { isRtkQueryError } from "@/lib/utils"
import EditProductDialog from "./edit-product-dialog"
import { Spinner } from "@/components/ui/spinner"

export default function ProductsTable() {
    const { data, isLoading } = useGetProductsQuery({});
    const [deleteProduct] = useDeleteProductMutation();
    const { toast } = useToast();

    if(isLoading) return <Spinner />;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            const result = await deleteProduct(id);
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
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data?.result.map((product: IProduct) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.description || '-'}</TableCell>
                            <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <EditProductDialog product={product} />
                                    <Button 
                                        variant="destructive" 
                                        size="icon"
                                        onClick={() => handleDelete(product.id)}
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
    );
}