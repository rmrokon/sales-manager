"use client"
import { PageLoayout } from "@/components";
import PaymentsTable from "./payments-table";
import CreatePaymentDialog from "./create-payment-dialog";

export default function Payments() {
  return (
    <PageLoayout title="Payments" buttons={[
      <CreatePaymentDialog key="create-payment" />
    ]}>
      <PaymentsTable />
    </PageLoayout>
  );
}