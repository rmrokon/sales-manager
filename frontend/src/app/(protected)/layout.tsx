"use client"
import { AppSidebar } from "@/components";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProtectedLayout({ children }: PropsWithChildren) {
    const { isLoggedIn, initializing } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [shouldShowContent, setShouldShowContent] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');

        if (!initializing) {
            if (isLoggedIn || hasToken) {
                setShouldShowContent(true);
            } else {
                setShouldShowContent(false);
                router.replace("/login");
            }
        }
    }, [mounted, initializing, isLoggedIn, router]);

    if (!mounted || initializing || !shouldShowContent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
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