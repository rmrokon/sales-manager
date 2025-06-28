import { Modal } from "@/components";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Zone } from "@/store/services/zone";
import ZoneForm from "./zone-form";

interface EditZoneDialogProps {
  zone: Zone;
}

export default function EditZoneDialog({ zone }: EditZoneDialogProps) {
  return (
    <Modal 
      title="Edit zone" 
      trigger={
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      }
    >
      <ZoneForm defaultValues={zone} />
    </Modal>
  );
}