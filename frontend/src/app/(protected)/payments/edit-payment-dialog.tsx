import { Modal } from "@/components";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Payment } from "@/utils/types/payment";
import PaymentForm from "./payment-form";

interface EditPaymentDialogProps {
  payment: Payment;
}

export default function EditPaymentDialog({ payment }: EditPaymentDialogProps) {
  return (
    <Modal 
      title="Edit Payment" 
      trigger={
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      }
    >
      <PaymentForm defaultValues={payment} />
    </Modal>
  );
}