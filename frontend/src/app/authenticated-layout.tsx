"use client"
import { AppSidebar } from "@/components";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RootState } from "@/store/store";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";

export default function AuthenticatedLayout({ children }: PropsWithChildren<{defaultOpen: boolean}>) {
    const { isLoggedIn, initializing } = useSelector((state: RootState) => state.auth);
  
    console.log({isLoggedIn}, {initializing});
    if(initializing) return <h3>Loading...</h3>;
    if (!isLoggedIn) {
      return <>{children}</>; // No sidebar for unauthenticated users
    }
    return (
      // <SidebarProvider defaultOpen={defaultOpen}>
       <>
        <AppSidebar />
        <SidebarTrigger />
        {children}
       </>
      // </SidebarProvider>
    );
  }