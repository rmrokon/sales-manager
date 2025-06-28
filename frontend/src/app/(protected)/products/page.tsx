"use client"
import { PageLoayout } from "@/components";
import ProductsTable from "./products-table";
import CreateProductDialog from "./create-product-dialog";

export default function Products(){
    return (
        <PageLoayout title="Products" buttons={[
            <CreateProductDialog key={'1'} />
        ]}>
            <ProductsTable />
        </PageLoayout>
    )
}