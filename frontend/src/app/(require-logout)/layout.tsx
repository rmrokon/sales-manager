"use client"
import { Spinner } from "@/components/ui/spinner";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function RequireLogoutLayout({children}: PropsWithChildren){
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
                setShouldShowContent(false);
                router.replace("/invoices");
            } else {
                setShouldShowContent(true);
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

    return <>{children}</>;
}