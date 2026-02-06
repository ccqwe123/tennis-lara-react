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
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Tennis Club
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {breadcrumbs.length > 0 && (
                                    <BreadcrumbSeparator className="hidden md:block" />
                                )}
                                {breadcrumbs.map((crumb, index) => (
                                    <BreadcrumbItem key={index}>
                                        {index < breadcrumbs.length - 1 ? (
                                            <>
                                                <BreadcrumbLink href={crumb.href}>
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                                <BreadcrumbSeparator className="hidden md:block" />
                                            </>
                                        ) : (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                ))}
                                {header && breadcrumbs.length === 0 && (
                                    <>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{header}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                    <main className="flex-1 overflow-auto">
                        <div className="p-4 md:p-0">{children}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}

