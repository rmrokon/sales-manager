"use client"
import { PageLoayout } from "@/components";
import ChannelsTable from "./channels-table";
import CreateUpdateChannelDialog from "./create-update-channel-dialog";

export default function Channels(){
    return (
        <PageLoayout title="Channels" buttons={[
            <CreateUpdateChannelDialog key={'Channels'} />
        ]}>
            <ChannelsTable />
            
        </PageLoayout>
    )
}