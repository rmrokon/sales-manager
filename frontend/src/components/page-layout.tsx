"use client"
import { PropsWithChildren, ReactNode } from "react";
import { useSidebar } from "./ui/sidebar";

interface IPageLayout {
    title: string; 
    subTitle?: string;
    buttons?: ReactNode[];
}

export default function PageLayout({title, subTitle, buttons, children}: PropsWithChildren<IPageLayout>){
    const {open} = useSidebar();
    return (
        <div className={`flex flex-col ${open ? "w-[80vw]" : "w-[93vw]"} p-12`}>
            <div className="flex flex-col">
                <div className="flex flex-col gap-6">
                    <h3>{title}</h3>
                    <p>{subTitle}</p>
                </div>
                <div className="flex items-center justify-end flex-wrap">
                    {
                        buttons?.map((btn, index) => <div key={index}>{btn}</div>)
                    }
                </div>
            </div>
            {children}
        </div>
    )
}