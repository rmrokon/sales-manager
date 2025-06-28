import { Modal } from "@/components";
import ProviderForm from "./provider-form";
import { Button } from "@/components/ui/button";

export default function CreateProviderDialog() {
    
    
    return (
        <Modal 
            title="Create provider" 
            trigger={
                <Button 
                    variant="outline" 
                >
                    Create provider
                </Button>
            }
        >
            <ProviderForm />
        </Modal>
    );
}
