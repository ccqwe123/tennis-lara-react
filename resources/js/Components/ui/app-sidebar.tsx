"use client"

import * as React from "react"
import { usePage } from "@inertiajs/react"
import { GalleryVerticalEnd } from "lucide-react"

import { NavMain } from "@/Components/ui/nav-main"
import { NavProjects } from "@/Components/ui/nav-projects"
// import { NavUser } from "@/Components/ui/nav-user"
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
            <div data-slot="sidebar-header" data-sidebar="header" className="flex flex-col gap-2 p-2">
                <ul data-slot="sidebar-menu" data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                    <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className="group/menu-item relative">
                        <button data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size="lg" data-active="false" className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden transition-[width,height,padding] active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! [&amp;&gt;span:last-child]:truncate [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 h-12 text-sm group-data-[collapsible=icon]:p-0! ring-sidebar-primary/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus-visible:ring-1" type="button" id="radix-:R36tjb:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <img alt="Shadcnblocks" loading="lazy" width="18" height="18" decoding="async" data-nimg="1" className="size-8" style={{ color: "transparent" }} src="/images/favicons/android-chrome-192x192.png" />
                            </div>
                            <div className="grid flex-1 text-left text-xs leading-tight">
                                <span className="truncate font-semibold">{team.name}</span>
                                <span className="truncate text-xs">{team.plan}</span>
                            </div>
                        </button>
                    </li>
                </ul>
            </div>

            <SidebarContent>
                <NavMain items={filteredNavMain} />
                {filteredNavProjects.length > 0 && (
                    <NavProjects projects={filteredNavProjects} />
                )}
            </SidebarContent>

            {/* hide if navbar is collapsed or not expanded (only show when expanded) */}
            <SidebarFooter
                className="group-data-[collapsible=icon]:hidden"
            >
                <div className="p-4 text-xs text-center text-muted-foreground">
                    TTC - All rights reserved © {new Date().getFullYear()}
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

