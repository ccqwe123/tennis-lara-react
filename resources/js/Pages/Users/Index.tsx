import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, useForm } from "@inertiajs/react"
import { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { Label } from "@/Components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"
import { Users, UserCheck, UserX, GraduationCap, Search, Plus, Pencil, Trash2, ArrowUpDown, Loader2, Key, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface User {
    id: number
    name: string
    email: string
    type: string
    created_at: string
    paid_bookings_count: number
    paid_tournaments_count: number
    phone?: string
}

interface Stats {
    total: number
    members: number
    non_members: number
    students: number
}

interface PaginatedUsers {
    data: User[]
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
    current_page: number
    last_page: number
    from: number
    to: number
    total: number
    per_page: number
}

interface UserTypeOption {
    value: string
    label: string
}

interface Props {
    auth: any
    users: PaginatedUsers
    stats: Stats
    filters: {
        search?: string
        sort_field?: string
        sort_direction?: string
    }
    userTypes: UserTypeOption[]
}

export default function UsersIndex({ auth, users, stats, filters, userTypes }: Props) {
    const [search, setSearch] = useState(filters.search || "")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const isAdmin = auth.user.type === 'admin'
    const isStaff = auth.user.type === 'staff'

    // Filter User Types for Staff (Non-Member and Student only)
    const availableUserTypes = useMemo(() => {
        if (isStaff) {
            return userTypes.filter(t => ['member', 'non-member', 'student'].includes(t.value))
        }
        return userTypes
    }, [isStaff, userTypes])

    // Create Form
    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, reset: resetCreate, errors: errorsCreate } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        type: 'non-member',
        phone: '',
    })

    // Edit Form
    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, reset: resetEdit, errors: errorsEdit } = useForm({
        name: '',
        email: '',
        type: '',
        phone: '',
    })

    // Change Password Form
    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: processingPassword, reset: resetPassword, errors: errorsPassword } = useForm({
        password: '',
        password_confirmation: '',
    })

    const openChangePassword = (user: User) => {
        setUserToChangePassword(user)
        resetPassword()
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    const submitChangePassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (!userToChangePassword) return

        putPassword(route('users.password.update', userToChangePassword.id), {
            onSuccess: () => {
                setUserToChangePassword(null)
                resetPassword()
                toast("Password updated successfully.")
            },
        })
    }

    // Search Logic
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.get(route('users.index'), { ...filters, search, page: 1 }, { preserveState: true })
    }

    const clearSearch = () => {
        setSearch("")
        router.get(route('users.index'), { ...filters, search: "", page: 1 }, { preserveState: true })
    }

    // Sort Logic
    const handleSort = (field: string) => {
        const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc'
        router.get(route('users.index'), { ...filters, sort_field: field, sort_direction: direction }, { preserveState: true })
    }

    const SortIcon = ({ field }: { field: string }) => {
        if (filters.sort_field !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        return <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sort_direction === 'asc' ? 'rotate-180' : ''}`} />
    }

    // Create
    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault()
        postCreate(route('users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false)
                resetCreate()
                toast("User created successfully.")
            },
        })
    }

    // Edit
    const openEdit = (user: User) => {
        setUserToEdit(user)
        setEditData({
            name: user.name,
            email: user.email,
            type: user.type,
            phone: user.phone || '', // Handle null phone
        })
        setIsEditOpen(true)
    }

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!userToEdit) return

        putEdit(route('users.update', userToEdit.id), {
            onSuccess: () => {
                setIsEditOpen(false)
                setUserToEdit(null)
                toast("User updated successfully.")
            },
        })
    }

    // Delete
    const confirmDelete = () => {
        if (!userToDelete) return
        router.delete(route('users.destroy', userToDelete.id), {
            onSuccess: () => {
                setUserToDelete(null)
                toast("User deleted successfully.")
            }
        })
    }

    // Badge Colors
    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'admin': return 'destructive'
            case 'staff': return 'secondary'
            case 'member': return 'default' // primary
            case 'student': return 'outline'
            default: return 'outline'
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Users</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Users' },
            ]}
        >
            <Head title="Users" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Members</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.members}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Non-Members</CardTitle>
                            <UserX className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.non_members}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.students}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions & Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-[300px]"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <Search className="h-4 w-4" />
                        </Button>
                        {filters.search && (
                            <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                                Clear
                            </Button>
                        )}
                    </form>

                    {isAdmin && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="w-4 h-4 mr-2" /> Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>Create a new user account.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-name">Name</Label>
                                            <Input id="create-name" value={createData.name} onChange={(e) => setCreateData('name', e.target.value)} required />
                                            {errorsCreate.name && <span className="text-sm text-red-500">{errorsCreate.name}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-type">Type</Label>
                                            <Select value={createData.type} onValueChange={(val) => setCreateData('type', val)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errorsCreate.type && <span className="text-sm text-red-500">{errorsCreate.type}</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-email">Email</Label>
                                        <Input id="create-email" type="email" value={createData.email} onChange={(e) => setCreateData('email', e.target.value)} required />
                                        {errorsCreate.email && <span className="text-sm text-red-500">{errorsCreate.email}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-phone">Phone (Optional)</Label>
                                        <Input id="create-phone" value={createData.phone} onChange={(e) => setCreateData('phone', e.target.value)} />
                                        {errorsCreate.phone && <span className="text-sm text-red-500">{errorsCreate.phone}</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-password">Password</Label>
                                            <Input id="create-password" type="password" value={createData.password} onChange={(e) => setCreateData('password', e.target.value)} required />
                                            {errorsCreate.password && <span className="text-sm text-red-500">{errorsCreate.password}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-password_confirmation">Confirm Password</Label>
                                            <Input id="create-password_confirmation" type="password" value={createData.password_confirmation} onChange={(e) => setCreateData('password_confirmation', e.target.value)} required />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={processingCreate} className="bg-emerald-600 hover:bg-emerald-700">
                                            {processingCreate ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Create User
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">Name <SortIcon field="name" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                                        <div className="flex items-center">Email <SortIcon field="email" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                                        <div className="flex items-center">Type <SortIcon field="type" /></div>
                                    </TableHead>
                                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('paid_bookings_count')}>
                                        <div className="flex items-center justify-center">Paid Bookings <SortIcon field="paid_bookings_count" /></div>
                                    </TableHead>
                                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('paid_tournaments_count')}>
                                        <div className="flex items-center justify-center">Paid Tournaments <SortIcon field="paid_tournaments_count" /></div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={getTypeBadgeVariant(user.type) as any}>
                                                    {userTypes.find(t => t.value === user.type)?.label || user.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{user.paid_bookings_count}</TableCell>
                                            <TableCell className="text-center">{user.paid_tournaments_count}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {(isAdmin || isStaff) && (
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                )}
                                                {isAdmin && (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => openChangePassword(user)} title="Change Password">
                                                            <Key className="h-4 w-4 text-amber-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </>
                                                )}
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
                    </div>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {(users.current_page - 1) * users.per_page + 1} to{" "}
                            {Math.min(users.current_page * users.per_page, users.total)} of{" "}
                            {users.total} results
                        </p>
                        <Pagination className="w-auto mx-0">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={users.links[0].url || '#'}
                                        isActive={!users.links[0].url}
                                        className={!users.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {users.links.slice(1, -1).map((link, i) => {
                                    if (link.label === '...') {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )
                                    }
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationLink href={link.url || '#'} isActive={link.active}>
                                                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href={users.links[users.links.length - 1].url || '#'}
                                        isActive={!users.links[users.links.length - 1].url}
                                        className={!users.links[users.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            {isStaff ? "Update user type." : "Update user details."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                disabled={isStaff}
                                required
                            />
                            {errorsEdit.name && <span className="text-sm text-red-500">{errorsEdit.name}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Type</Label>
                            <Select value={editData.type} onValueChange={(val) => setEditData('type', val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUserTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorsEdit.type && <span className="text-sm text-red-500">{errorsEdit.type}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData('email', e.target.value)}
                                disabled={isStaff}
                                required
                            />
                            {errorsEdit.email && <span className="text-sm text-red-500">{errorsEdit.email}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone (Optional)</Label>
                            <Input
                                id="edit-phone"
                                value={editData.phone}
                                onChange={(e) => setEditData('phone', e.target.value)}
                                disabled={isStaff}
                            />
                            {errorsEdit.phone && <span className="text-sm text-red-500">{errorsEdit.phone}</span>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processingEdit} className="bg-emerald-600 hover:bg-emerald-700">
                                {processingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={!!userToChangePassword} onOpenChange={(open) => !open && setUserToChangePassword(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Changing password for <span className="font-semibold">{userToChangePassword?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitChangePassword} className="space-y-4" autoComplete="off">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                            {errorsPassword.password && <span className="text-sm text-red-500">{errorsPassword.password}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password-confirm">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password-confirm"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setUserToChangePassword(null)}>Cancel</Button>
                            <Button type="submit" disabled={processingPassword} className="bg-amber-600 hover:bg-amber-700">
                                {processingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{userToDelete?.name}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel asChild>
                            <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
