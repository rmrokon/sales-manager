import { PropsWithChildren, ReactElement } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface ModalProps {
    trigger: ReactElement;
    title?: string;
    description?: string;
}

export default function Modal({trigger, title, description, children}: PropsWithChildren<ModalProps>){
    return <Dialog>
    <DialogTrigger>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
    <DialogClose>Close</DialogClose>

        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>
          {description}
        </DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
}