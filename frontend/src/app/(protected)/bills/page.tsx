"use client"
import { PageLoayout } from "@/components"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import BillsTable from "./bills-table"
import CreateBillDialog from "./create-bill-dialog"
import { useState } from "react"

export default function BillsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <PageLoayout 
      title="Bills" 
      buttons={[
        <Button key="create" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Bill
        </Button>
      ]}
    >
      <BillsTable />
      <CreateBillDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </PageLoayout>
  )
}
