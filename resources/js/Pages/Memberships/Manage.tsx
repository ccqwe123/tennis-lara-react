import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { Search, Plus, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/Components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { cn } from "@/lib/utils"

interface PageProps {
    auth: any
    fees: { [key: string]: string }
    users: {
        data: {
            id: number
            name: string
            email: string
            type: string
            membership_status: string
            current_plan: string
            subscription_id: number | null
            start_date: string
            expiry_date: string
            is_expiring: boolean
        }[]
        links: any[]
    }
    filters: {
        search?: string
        status?: string
        sort?: string
        direction?: string
    }
}

export default function MembershipManage({ auth, users, filters }: PageProps) {
    const { props } = usePage()
    const [search, setSearch] = useState(filters.search || "")
    const [statusFilter, setStatusFilter] = useState(filters.status || "all")

    // Edit Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        type: "annual",
        start_date: "",
        end_date: ""
    })

    const handleSearch = () => {
        router.get(route('memberships.manage'), {
            ...filters,
            search,
            status: statusFilter
        }, { preserveState: true })
    }

    const handleFilterChange = (val: string) => {
        setStatusFilter(val)
        router.get(route('memberships.manage'), {
            ...filters,
            search,
            status: val,
            page: 1 // Reset to first page on filter change
        }, { preserveState: true })
    }

    const handleSort = (column: string) => {
        const currentDirection = filters.direction || 'asc'
        const newDirection = (filters.sort === column && currentDirection === 'asc') ? 'desc' : 'asc'

        router.get(route('memberships.manage'), {
            ...filters,
            sort: column,
            direction: newDirection
        }, { preserveState: true })
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (filters.sort !== column) return null
        return filters.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    const openEditDialog = (user: any) => {
        setEditingUser(user)

        const parseDate = (dateStr: string) => {
            if (!dateStr || dateStr === '-' || dateStr === 'Lifetime') return ''
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return ''
            // Adjust for local timezone offset to prevent date shifting
            const offset = date.getTimezoneOffset()
            const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000))
            return adjustedDate.toISOString().split('T')[0]
        }

        setFormData({
            type: user.current_plan === 'None' ? 'annual' : user.current_plan.toLowerCase(),
            start_date: parseDate(user.start_date),
            end_date: parseDate(user.expiry_date)
        })
        setIsDialogOpen(true)
    }

    const closeEditDialog = () => {
        setIsDialogOpen(false)
        setEditingUser(null)
    }

    const handleUpdate = () => {
        if (!editingUser) return

        router.put(route('memberships.update', editingUser.id), formData, {
            onSuccess: () => {
                toast.success("Membership updated successfully")
                closeEditDialog()
            },
            onError: (errors) => {
                toast.error("Failed to update membership. Please check input.")
                console.error(errors)
            }
        })
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Members</h2>}
        >
            <Head title="Manage Members" />

            <div className="py-6 w-full px-4 sm:px-6 lg:px-8">
                <div className="w-full space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Membership Management</h1>
                        <Link href={route('memberships.create')}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Membership
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                {/* Search */}
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search name or email..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                {/* Tabs for Filter */}
                                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => handleFilterChange('all')}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            statusFilter === 'all'
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
                                        )}
                                    >
                                        All Users
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('member')}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            statusFilter === 'member'
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
                                        )}
                                    >
                                        Members
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('non-member')}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            statusFilter === 'non-member'
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
                                        )}
                                    >
                                        Non-Members
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                User <SortIcon column="name" />
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => handleSort('membership_status')}
                                        >
                                            <div className="flex items-center">
                                                Status <SortIcon column="membership_status" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Current Plan</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                className={cn(user.is_expiring && "bg-amber-50 hover:bg-amber-100")}
                                            >
                                                <TableCell>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {user.name}
                                                        {user.is_expiring && (
                                                            <span title="Expiring soon" className="text-amber-500">
                                                                <AlertTriangle className="h-4 w-4" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={user.membership_status === 'member' ? 'default' : 'secondary'}
                                                        className={user.membership_status === 'member' ? 'bg-emerald-500' : ''}
                                                    >
                                                        {user.membership_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.current_plan}</TableCell>
                                                <TableCell>{user.start_date}</TableCell>
                                                <TableCell>
                                                    <span className={cn(user.is_expiring && "font-bold text-amber-600")}>
                                                        {user.expiry_date}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(user)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {users.links && (
                            <CardFooter className="flex justify-center border-t p-4">
                                <div className="flex gap-1">
                                    {users.links.map((link: any, i: number) => (
                                        link.url ? (
                                            <Link key={i} href={link.url}>
                                                <Button
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(link.active && "bg-emerald-600 hover:bg-emerald-700")}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            </Link>
                                        ) : (
                                            <Button key={i} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Membership</DialogTitle>
                        <DialogDescription>
                            Update membership details for {editingUser?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="plan">Plan Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="lifetime">Lifetime</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                disabled={formData.type === 'lifetime'}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditDialog}>Cancel</Button>
                        <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
