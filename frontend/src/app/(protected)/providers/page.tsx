"use client"
import { PageLoayout } from "@/components";
import ProvidersTable from "./providers-table";
import CreateProviderDialog from "./create-provider-dialog";

export default function Providers(){
    return (
        <PageLoayout title="Providers" buttons={[
            <CreateProviderDialog key={'1'} />
                ]}>
            <ProvidersTable />
        </PageLoayout>
    )
}