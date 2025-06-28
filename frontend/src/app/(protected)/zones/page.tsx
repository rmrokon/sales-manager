"use client"
import { PageLoayout } from "@/components";
import ZonesTable from "./zones-table";
import CreateZoneDialog from "./create-zone-dialog";

export default function Zones(){
    return (
        <PageLoayout title="Zones" buttons={[
            <CreateZoneDialog key={'1'} />
                ]}>
            <ZonesTable />
        </PageLoayout>
    )
}
