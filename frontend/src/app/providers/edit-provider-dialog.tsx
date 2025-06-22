import { Modal } from "@/components";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { IProvider } from "@/utils/types/provider";
import ProviderForm from "./provider-form";

interface EditProviderDialogProps {
  provider: IProvider;
}

export default function EditProviderDialog({ provider }: EditProviderDialogProps) {
  return (
    <Modal 
      title="Edit provider" 
      trigger={
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      }
    >
      <ProviderForm defaultValues={provider} />
    </Modal>
  );
}