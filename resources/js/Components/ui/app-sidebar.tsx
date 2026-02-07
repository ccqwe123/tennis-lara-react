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
            // Check if any child is active (strict match)
            const isChildActive = item.items?.some(sub => sub.url === url)

            // Parent is active if a child is active OR if the parent URL strictly matches (if it has no children logic, though here logic is slightly different)
            // Actually, for the group to be open (isActive on parent), we usually want it open if we are in a sub-route?
            // But Shadcn sidebar 'isActive' on a group usually means "expanded".
            // Let's keep it expanded if URL starts with the item URL (group scope).

            // But for the user complaint: "sub settings is show active". This refers to the leaves.
            // So we change the leave's isActive logic.

            return {
                ...item,
                isActive: item.items?.some(sub => url.startsWith(sub.url)) || url.startsWith(item.url), // Parent expanded state - keep it loose?
                items: item.items?.map(sub => ({
                    ...sub,
                    isActive: sub.url === url // Strict match for leaves
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

