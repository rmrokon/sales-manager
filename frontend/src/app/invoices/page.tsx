"use client"
import { PageLoayout } from "@/components"
import InvoicesTable from "./invoices-table"
import CreateInvoiceButton from "./create-invoice-button"

export default function Invoices() {
  return (
    <PageLoayout title="Invoices" buttons={[
      <CreateInvoiceButton key="create-invoice" />
    ]}>
      <InvoicesTable />
    </PageLoayout>
  )
}