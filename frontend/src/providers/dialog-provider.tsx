import { ReactElement } from "react";
import { Dialog } from "@/components/ui/dialog";

export default function DialogProvider({children}: {children: ReactElement}){
    return <Dialog>{children}</Dialog>
}