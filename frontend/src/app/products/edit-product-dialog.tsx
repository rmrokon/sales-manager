import { Modal } from "@/components";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { IProduct } from "@/utils/types/product";
import ProductForm from "./product-form";

interface EditProductDialogProps {
  product: IProduct;
}

export default function EditProductDialog({ product }: EditProductDialogProps) {
  
  return (
    <Modal 
      title="Edit product" 
      trigger={
        <Button 
          variant="outline" 
          size="icon" 
        >
          <Edit />
        </Button>
      }
    >
      <ProductForm defaultValues={product} />
    </Modal>
  );
}