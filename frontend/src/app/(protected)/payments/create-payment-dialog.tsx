import { Modal } from "@/components";
import PaymentForm from "./payment-form";
import { Button } from "@/components/ui/button";

interface CreatePaymentDialogProps {
  preselectedInvoiceId?: string;
}

export default function CreatePaymentDialog({ preselectedInvoiceId }: CreatePaymentDialogProps) {
  return (
    <Modal 
      title="Record Payment" 
      trigger={
        <Button>
          Record Payment
        </Button>
      }
    >
      <PaymentForm preselectedInvoiceId={preselectedInvoiceId} />
    </Modal>
  );
}