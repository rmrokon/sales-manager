"use client"
import { PageLoayout } from "@/components";
import EmployeesTable from "./employees-table";

export default function Employees(){
    return (
        <PageLoayout title="Employees">
            <EmployeesTable />
        </PageLoayout>
    )
}