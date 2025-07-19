"use client"
import { AppSidebar } from "@/components";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

export default function ProtectedLayout({ children }: PropsWithChildren) {
    const router = useRouter();
    const token = localStorage.getItem("accessToken");
    if(!token) {
        router.replace("/login");
        return;
    }

    const defaultOpen = typeof window !== "undefined"
        ? localStorage.getItem("sidebar:state") === "true"
        : false;
    
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex min-h-screen">
                <AppSidebar />
                <div className="flex-1">
                    <div className="flex items-center p-2 border-b">
                        <SidebarTrigger />
                    </div>
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}