export type UserType = 'admin' | 'staff' | 'member' | 'non-member' | 'student';

export interface User {
    id: number;
    name: string;
    email: string;
    type: UserType;
    avatar?: string;
    phone?: string;
}

export interface Permissions {
    isAdmin: boolean;
    isStaff: boolean;
    isMember: boolean;
    isNonMember: boolean;
    hasAdminAccess: boolean;
    hasStaffAccess: boolean;
    hasMemberAccess: boolean;
}

export interface Auth {
    user: User | null;
    permissions: Permissions | null;
}

export interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

// Helper type for components that need auth
export interface WithAuth {
    auth: Auth;
}

// Import LucideIcon type for navigation
import type { LucideIcon } from "lucide-react";

// Navigation types - using LucideIcon for shadcn compatibility
export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    roles?: UserType[];
    items?: Omit<NavItem, 'icon' | 'items' | 'isActive'>[];
}

export interface NavProject {
    name: string;
    url: string;
    icon: LucideIcon;
    roles?: UserType[];
}
