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
import { useGetCompaniesQuery } from "@/store/services/company"
import { ICompany } from "@/utils/types/company"


export default function CompaniesTable() {
    const {data, isLoading} = useGetCompaniesQuery({});
    if(isLoading) return <h3>Loading...</h3>;
    return (
        <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
                <TableRow>
                    <TableHead className="">Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data?.result.map((company: ICompany) => (
                        <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <Button variant="destructive" size="icon">
                                    <Delete />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}