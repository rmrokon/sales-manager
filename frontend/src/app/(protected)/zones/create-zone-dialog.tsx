import { Modal } from "@/components";
import ZoneForm from "./zone-form";
import { Button } from "@/components/ui/button";

export default function CreateZoneDialog() {
    return (
        <Modal 
            title="Create zone" 
            trigger={
                <Button 
                    variant="outline" 
                >
                    Create zone
                </Button>
            }
        >
            <ZoneForm />
        </Modal>
    );
}