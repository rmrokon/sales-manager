import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"


export default function EmployeesTable() {
    return (
        <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
                <TableRow>
                    <TableHead className="">Employee Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell className="flex gap-4 justify-center">
                    <Button variant="outline">Edit</Button>
                    <Button variant="outline"><Delete className="text-red-600"/> Delete</Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}