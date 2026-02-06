"use client"

import * as React from "react"
import { usePage } from "@inertiajs/react"
import { GalleryVerticalEnd } from "lucide-react"

import { NavMain } from "@/Components/ui/nav-main"
import { NavProjects } from "@/Components/ui/nav-projects"
import { NavUser } from "@/Components/ui/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/Components/ui/sidebar"
import {
    navMain,
    navProjects,
    filterNavMainByRole,
    filterNavByRole,
} from "@/config/navigation"
import type { PageProps } from "@/types"
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { url, props: pageProps } = usePage<PageProps>()
    const { auth } = pageProps
    const user = auth.user
    const userType = user?.type

    // Filter navigation items based on user role and set active state
    const filteredNavMain = React.useMemo(() => {
        const filtered = filterNavMainByRole(navMain, userType)
        return filtered.map(item => {
            const isChildActive = item.items?.some(sub => url.startsWith(sub.url))
            const isActive = item.items?.length
                ? isChildActive
                : url.startsWith(item.url)

            return {
                ...item,
                isActive: !!isActive,
                items: item.items?.map(sub => ({
                    ...sub,
                    isActive: url.startsWith(sub.url)
                }))
            }
        })
    }, [userType, url])

    const filteredNavProjects = React.useMemo(() => {
        const filtered = filterNavByRole(navProjects, userType)
        return filtered.map(item => ({
            ...item,
            isActive: url.startsWith(item.url)
        }))
    }, [userType, url])

    // Team/brand info
    const team = {
        name: "TTC",
        plan: user?.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : "Guest",
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r-0">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-transparent">
                        <img src="/images/logo.png" alt="Tennis Club" className="size-8 object-contain" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{team.name}</span>
                        <span className="truncate text-xs">{team.plan}</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavMain} />
                {filteredNavProjects.length > 0 && (
                    <NavProjects projects={filteredNavProjects} />
                )}
            </SidebarContent>

            <SidebarFooter>
                {user && <NavUser user={user} />}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

