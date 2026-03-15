import {
    AudioWaveform,
    BookOpen,
    Calendar,
    CreditCard,
    GalleryVerticalEnd,
    LayoutDashboard,
    Settings2,
    Trophy,
    PhilippinePeso,
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
        roles: ['admin', 'staff', 'member', 'non-member', 'student'],
    },
    {
        title: "Court",
        url: "/bookings",
        icon: Calendar,
        roles: ['admin', 'staff', 'member', 'non-member', 'student'],
        items: [
            { title: "My Bookings", url: "/my-bookings", roles: ['member', 'non-member', 'student'] },
            { title: "Book Court", url: "/bookings/create", roles: ['admin', 'staff', 'member', 'non-member', 'student'] },
            { title: "All Bookings", url: "/bookings", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Tournaments",
        url: "/tournaments",
        icon: Trophy,
        roles: ['admin', 'staff'],
        items: [
            { title: "View Tournaments", url: "/tournaments", roles: ['admin', 'staff', 'member', 'non-member', 'student'] },
            { title: "Manage", url: "/tournaments/manage", roles: ['admin'] },
            { title: "Book Tournament Court", url: "#", isModal: "book-tournament-court", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Tournaments",
        url: "/tournaments",
        icon: Trophy,
        roles: ['member', 'non-member', 'student'],
    },
    {
        title: "Membership",
        url: "/memberships",
        icon: UserCheck,
        roles: ['admin', 'staff', 'member', 'non-member', 'student'],
        items: [
            { title: "My Membership", url: "/memberships", roles: ['member', 'non-member', 'student'] },
            { title: "Manage Members", url: "/manage-memberships", roles: ['admin', 'staff'] },
            { title: "Add Membership", url: "/memberships/create", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Payments",
        url: "/payments/verify",
        icon: CreditCard,
        roles: ['admin', 'staff'],
        items: [
            { title: "Court Payments", url: "/payments/verify/court", roles: ['admin', 'staff'] },
            { title: "Tournament Registration", url: "/payments/verify/tournament", roles: ['admin', 'staff'] },
            { title: "Tournament Court Bookings", url: "/payments/verify/tournament-court", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Users",
        url: "/users",
        icon: Receipt,
        roles: ['admin', 'staff'],
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BookOpen,
        roles: ['admin', 'staff'],
        items: [
            { title: "Court Booking Reports", url: "/reports/bookings", roles: ['admin', 'staff'] },
            { title: "Revenue Reports", url: "/reports/revenue", roles: ['admin'] },
            { title: "Member Reports", url: "/reports/members", roles: ['admin', 'staff'] },
            { title: "Tournament Registration Reports", url: "/reports/tournaments", roles: ['admin', 'staff'] },
            { title: "Tournament Court Reports", url: "/reports/tournament-courts", roles: ['admin', 'staff'] },
        ],
    },
    {
        title: "Expenses",
        url: "/expenses",
        icon: Receipt,
        roles: ['admin'],
    },
    {
        title: "Income",
        url: "/incomes",
        icon: PhilippinePeso,
        roles: ['admin'],
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        roles: ['admin'],
        items: [
            { title: "General", url: "/settings", roles: ['admin'] },
            { title: "Activity Logs", url: "/settings/activity-logs", roles: ['admin'] },
        ],
    },
    {
        title: "User Guide",
        url: "/user-guide",
        icon: BookOpen,
        roles: ['admin', 'staff', 'member', 'non-member', 'student'],
    },
]

// Quick access projects/actions
export const navProjects: NavProject[] = [
    // {
    //     name: "Quick Booking",
    //     url: "/bookings/create",
    //     icon: Calendar,
    //     roles: ['admin', 'staff', 'member'],
    // },
    // {
    //     name: "View Receipts",
    //     url: "/receipts",
    //     icon: Receipt,
    //     roles: ['admin', 'staff', 'member', 'non-member'],
    // },
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
