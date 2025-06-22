import { PropsWithChildren, ReactElement } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useDialog } from "@/hooks/use-dialog";

interface ModalProps {
    trigger: ReactElement;
    title?: string;
    description?: string;
    // open?: boolean;
    // onOpenChange?: (open: boolean) => void;
}

export default function Modal({trigger, title, description, children}: PropsWithChildren<ModalProps>){
  const {isOpen, setIsOpen} = useDialog();
    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>
          {description}
        </DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
}