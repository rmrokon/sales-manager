import { Modal } from "@/components";
import ProductForm from "./product-form";
import { Button } from "@/components/ui/button";

export default function CreateProductDialog() {
    
    return (
        <Modal 
            title="Create product"
            trigger={
                <Button 
                    variant="outline" 
                >
                    Create product
                </Button>
            }
        >
            <ProductForm />
        </Modal>
    );
}