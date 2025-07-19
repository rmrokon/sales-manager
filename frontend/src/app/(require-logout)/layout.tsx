"use client"

import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

export default function RequireLogoutLayout({children}: PropsWithChildren){
    const router = useRouter();
    const token = localStorage.getItem("accessToken");
    if(token) {
        router.replace("/invoices");
        return;
    }
    return <>{children}</>;
}