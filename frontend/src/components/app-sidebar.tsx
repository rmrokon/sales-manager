"use client"
import { Banknote, Building2, ChevronUp, FileText, Home, LocateIcon, Moon, Package, Receipt, RotateCcw, Settings, Sun, Truck, User2, Warehouse } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { changeTheme, ThemeState } from "@/store/reducers/theme.reducer";
import { useEffect } from "react";
import { setAuthUser } from "@/store/reducers/auth.reducer";
import { usePathname, useRouter } from "next/navigation";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

// const dropDown = <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//         <SidebarMenuAction>
//             <MoreHorizontal />
//         </SidebarMenuAction>
//     </DropdownMenuTrigger>
//     <DropdownMenuContent side="right" align="start">
//         <DropdownMenuItem>
//             <span>Edit Project</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem>
//             <span>Delete Project</span>
//         </DropdownMenuItem>
//     </DropdownMenuContent>
// </DropdownMenu>;

// Menu items.
const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Providers",
        url: "/providers",
        icon: Truck,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Products",
        url: "/products",
        icon: Package,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Inventory",
        url: "/inventory",
        icon: Warehouse,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: Receipt,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Bills",
        url: "/bills",
        icon: FileText,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Zones",
        url: "/zones",
        icon: LocateIcon,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Payments",
        url: "/payments",
        icon: Banknote,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Returns",
        url: "/returns",
        icon: RotateCcw,
        actionBtn: <></>,
        dropDown: <></>,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
        actionBtn: <></>,
        dropDown: <></>,
    },
]

export default function AppSidebar() {
    const { open } = useSidebar();
    const theme = useSelector((state: RootState) => state.theme.theme);
    const { company, user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const handleChangeTheme = (themeInput: ThemeState["theme"]) => {
        localStorage.setItem('theme', themeInput);
        dispatch(changeTheme(themeInput));
        if (themeInput === 'dark' && theme === 'light') {
            document.body.classList.add('dark');
        }
        else if (themeInput === 'light' && theme === 'dark') {
            document.body.classList.remove('dark');
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        dispatch(setAuthUser({}));
        router.replace("/login");
    }

    useEffect(() => {
        const th = localStorage.getItem('theme') as unknown as ThemeState["theme"];
        dispatch(changeTheme(th));
        document.body.classList.add(th);
        // if(th === 'dark' && theme === 'light'){
        //     document.body.classList.add('dark');
        // }
        // else if(th === 'light' && theme === 'dark' ) {
        //     document.body.classList.remove('dark');
        // }
    }, [])
    return (
        <Sidebar collapsible="icon">
            {/* Sidebar Header */}

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Building2 />
                                    {company?.name || company?.email}
                                    {/* <ChevronDown className="ml-auto" /> */}
                                </SidebarMenuButton>

                            </DropdownMenuTrigger>
                            {/* <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>
                                    <span>Acme Inc</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Acme Corp.</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent> */}
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar header end */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + '/')}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                            <>{item?.actionBtn}</>
                                            <>{item?.dropDown}</>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Sidebar footer start */}

            <SidebarFooter>
                <SidebarMenu>
                    {/* <Collapsible defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>Companies</SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>Create</SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible> */}
                    <SidebarMenuItem>
                        <div className="flex justify-between items-center">
                            {
                                open ?
                                    <>
                                        <span onClick={() => handleChangeTheme('dark')} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${theme === 'dark' ? "bg-sidebar-accent" : ""}`}>
                                            <Moon /> Dark
                                        </span>

                                        <span onClick={() => handleChangeTheme('light')} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${theme === 'light' ? "bg-sidebar-accent" : ""}`}>
                                            <Sun /> Light
                                        </span>
                                    </>
                                    :
                                    <>
                                        {
                                            theme === 'dark' ?
                                                <Sun className="cursor-pointer" onClick={() => handleChangeTheme('light')} />
                                                :
                                                <Moon className="cursor-pointer" onClick={() => handleChangeTheme('dark')} />
                                        }
                                    </>
                            }
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 />
                                    {
                                        !user?.firstName && !user?.lastName ?
                                            <span>{user?.email}</span>
                                            :
                                            <span>{`${user?.firstName} ${user?.lastName}`}</span>
                                    }
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {/* Sidebar footer end */}
        </Sidebar>
    )
}
