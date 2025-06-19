import { Modal } from "@/components";
import CreateUpdateChannelForm from "./create-update-channel-form";
import { IChannel } from "@/utils/types/channel";
import { PenIcon, PlusIcon } from "lucide-react";

export default function CreateUpdateChannelDialog({defaultValues}: {defaultValues?: Partial<IChannel>}) {
    return <Modal title="Create channel" trigger={defaultValues?.id ? <PenIcon /> : <PlusIcon />}>
      <CreateUpdateChannelForm defaultValues={defaultValues} />
    </Modal>
  
  
}