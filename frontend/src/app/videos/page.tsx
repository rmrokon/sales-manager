"use client"
import { PageLoayout } from "@/components";
import VideosTable from "./videos-table";

export default function Channels(){
    return (
        <PageLoayout title="Videos">
            <VideosTable />
        </PageLoayout>
    )
}