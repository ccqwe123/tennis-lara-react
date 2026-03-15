import { Badge } from "@/Components/ui/badge"
import { cn } from "@/lib/utils"

interface BadgeProps {
    type: 'payment_method' | 'user_type' | 'payment_status' | 'booking_status' | 'trainer'
    value: string
    className?: string
}

export function StatusBadge({ type, value, className }: BadgeProps) {
    const lowerValue = value?.toLowerCase() || ''

    if (type === 'payment_method') {
        if (lowerValue === 'cash') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-green-100 text-green-800 border-green-200", className)}>Cash</Badge>
        }
        if (lowerValue === 'gcash') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-blue-100 text-blue-800 border-blue-200", className)}>GCash</Badge>
        }
        return <Badge variant="outline" className={className}>{value}</Badge>
    }

    if (type === 'user_type') {
        if (lowerValue === 'member') {
            return <Badge variant="outline" className={cn("text-xs bg-indigo-100 text-indigo-800 border-indigo-200", className)}>Member</Badge>
        }
        if (lowerValue === 'non-member' || lowerValue === 'non member') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-amber-100 text-amber-800 border-amber-200", className)}>Non-Member</Badge>
        }
        if (lowerValue === 'guest') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-slate-100 text-slate-800 border-slate-200", className)}>Guest</Badge>
        }
        if (lowerValue === 'student') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-teal-100 text-teal-800 border-teal-200", className)}>Student</Badge>
        }
        // Admin/Staff
        if (lowerValue === 'admin') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-purple-100 text-purple-800 border-purple-200", className)}>Admin</Badge>
        }
        if (lowerValue === 'staff') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-pink-100 text-pink-800 border-pink-200", className)}>Staff</Badge>
        }
        return <Badge variant="outline" className={className}>{value}</Badge>
    }

    if (type === 'payment_status') {
        if (lowerValue === 'paid') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-emerald-100 text-emerald-800 border-emerald-200", className)}>Paid</Badge>
        }
        if (lowerValue === 'pending' || lowerValue === 'unpaid') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-gray-100 text-gray-800 border-gray-200", className)}>Pending</Badge>
        }
        if (lowerValue === 'cancelled') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-red-200 text-red-800 border-red-200", className)}>Cancelled</Badge>
        }
        return <Badge variant="outline" className={cn("text-xs px-6 py-3", className)}>{value}</Badge>
    }

    if (type === 'trainer') {
        if (lowerValue === 'yes') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-primary text-white border-primary", className)}>Yes</Badge>
        }
        if (lowerValue === 'no') {
            return <Badge variant="outline" className={cn("text-xs px-6 py-3 bg-gray-100 text-gray-800 border-gray-200", className)}>No</Badge>
        }
        return <Badge variant="outline" className={cn("text-xs px-6 py-3", className)}>{value}</Badge>
    }

    return <Badge variant="outline" className={cn("text-xs px-6 py-3", className)}>{value}</Badge>
}
