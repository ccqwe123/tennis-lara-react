import { HeaderNotifications } from "@/Components/HeaderNotifications"
import { HeaderUserMenu } from "@/Components/HeaderUserMenu"
import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/Components/ui/sidebar"
import { AppSidebar } from "@/Components/ui/app-sidebar"
import { Separator } from "@/Components/ui/separator"
import { TooltipProvider } from "@/Components/ui/tooltip"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

interface AuthenticatedLayoutProps {
    children: ReactNode
    header?: ReactNode | string
    breadcrumbs?: { label: string; href?: string }[]
}

export default function AuthenticatedLayout({
    children,
    header,
    breadcrumbs = [],
}: AuthenticatedLayoutProps) {
    const user = usePage().props.auth.user

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md transition-all">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <BreadcrumbItem key={index}>
                                        {breadcrumb.href ? (
                                            <BreadcrumbLink href={breadcrumb.href}>
                                                {breadcrumb.label}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                                        )}
                                        {index < breadcrumbs.length - 1 && (
                                            <BreadcrumbSeparator />
                                        )}
                                    </BreadcrumbItem>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="ml-auto flex items-center gap-2">
                            <HeaderNotifications />
                            <HeaderUserMenu user={user} />
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto">
                        <div className="p-4 md:p-0">{children}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}

