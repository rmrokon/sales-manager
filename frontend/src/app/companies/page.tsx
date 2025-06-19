"use client"
import { PageLoayout } from "@/components";
import CompaniesTable from "./companies-table";
import CreateCompanyDialog from "./create-company-dialog";

export default function Companies(){
    return (
        <PageLoayout title="Companies" buttons={[
            <CreateCompanyDialog key={'1'} />
                ]}>
            <CompaniesTable />
        </PageLoayout>
    )
}