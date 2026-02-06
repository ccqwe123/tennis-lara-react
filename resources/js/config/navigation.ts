import {
    AudioWaveform,
    BookOpen,
    Calendar,
    CreditCard,
    GalleryVerticalEnd,
    LayoutDashboard,
    Settings2,
    Trophy,
    Users,
    UserCheck,
    Receipt,
    type LucideIcon,
} from "lucide-react"
import type { UserType, NavItem, NavProject } from "@/types"

// Team/brand configuration
export const teams = [
    {
        name: "Tennis Club",
        logo: GalleryVerticalEnd,
        plan: "Pro",
    },
]

// Main navigation items with role-based access
export const navMain: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ['admin', 'staff', 'member', 'non-member'],
    },
    {
        title: "Bookings",
        url: "/bookings",
        icon: Calendar,
        roles: ['admin', 'staff', 'member', 'non-member'],
        items: [
            { title: "My Bookings", url: "/my-bookings", roles: ['member', 'non-member'] },
            { title: "Book Court", url: "/bookings/create", roles: ['admin', 'staff', 'member', 'non-member'] },
            { title: "All Bookings", url: "/bookings", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Tournaments",
        url: "/tournaments",
        icon: Trophy,
        roles: ['admin', 'staff'],
        items: [
            { title: "View Tournaments", url: "/tournaments", roles: ['admin', 'staff', 'member', 'non-member'] },
            { title: "Manage", url: "/tournaments/manage", roles: ['admin'] },
        ],
    },
    {
        title: "Tournaments",
        url: "/tournaments",
        icon: Trophy,
        roles: ['member', 'non-member'],
    },
    {
        title: "Membership",
        url: "/memberships",
        icon: UserCheck,
        roles: ['admin', 'staff', 'member', 'non-member'],
        items: [
            { title: "My Membership", url: "/memberships", roles: ['member', 'non-member'] },
            { title: "Manage Members", url: "/manage-memberships", roles: ['admin', 'staff'] },
            { title: "Add Membership", url: "/memberships/create", roles: ['admin', 'staff'] },
        ],
    },
    // {
    //     title: "Payments",
    //     url: "/payments",
    //     icon: CreditCard,
    //     roles: ['admin', 'staff', 'member', 'non-member'],
    //     items: [
    //         { title: "My Payments", url: "/payments", roles: ['admin', 'staff', 'member', 'non-member'] },
    //         { title: "Verify Payments", url: "/payments/verify", roles: ['admin', 'staff'] },
    //     ],
    // },
    {
        title: "Users",
        url: "/users",
        icon: Users,
        roles: ['admin', 'staff'],
        items: [
            { title: "All Users", url: "/users", roles: ['admin', 'staff'] },
            { title: "Add User", url: "/users/create", roles: ['admin'] },
        ],
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BookOpen,
        roles: ['admin', 'staff'],
        items: [
            { title: "Booking Reports", url: "/reports/bookings", roles: ['admin', 'staff'] },
            { title: "Revenue Reports", url: "/reports/revenue", roles: ['admin'] },
            { title: "Member Reports", url: "/reports/members", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        roles: ['admin'],
        items: [
            { title: "General", url: "/settings", roles: ['admin'] },
            { title: "Fees & Pricing", url: "/settings/fees", roles: ['admin'] },
            { title: "Discounts", url: "/settings/discounts", roles: ['admin'] },
        ],
    },
]

// Quick access projects/actions
export const navProjects: NavProject[] = [
    {
        name: "Quick Booking",
        url: "/bookings/create",
        icon: Calendar,
        roles: ['admin', 'staff', 'member'],
    },
    {
        name: "View Receipts",
        url: "/receipts",
        icon: Receipt,
        roles: ['admin', 'staff', 'member', 'non-member'],
    },
]

/**
 * Filter navigation items based on user role
 */
export function filterNavByRole<T extends { roles?: UserType[] }>(
    items: T[],
    userType: UserType | undefined
): T[] {
    if (!userType) return []

    return items.filter(item => {
        if (!item.roles) return true
        return item.roles.includes(userType)
    })
}

/**
 * Filter nav items and their sub-items based on user role
 */
export function filterNavMainByRole(
    items: NavItem[],
    userType: UserType | undefined
): NavItem[] {
    if (!userType) return []

    return items
        .filter(item => !item.roles || item.roles.includes(userType))
        .map(item => ({
            ...item,
            items: item.items?.filter(subItem =>
                !subItem.roles || subItem.roles.includes(userType)
            ),
        }))
        .filter(item => {
            // Keep item if it has no sub-items originally, or if it still has visible sub-items
            if (!item.items) return true
            return item.items.length > 0
        })
}
