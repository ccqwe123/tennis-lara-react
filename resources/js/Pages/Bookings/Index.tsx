import { useState } from "react"
import { router } from "@inertiajs/react"
import { Search, Filter, Calendar, DollarSign, ChevronLeft, ChevronRight, CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { format } from "date-fns"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar as CalendarComponent } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"

interface Booking {
    id: number
    user_name: string
    user_email: string
    membership_status: string
    schedule_type: string
    booking_date: string
    booking_date_raw: string
    games_count: number
    with_trainer: boolean
    payment_method: string
    payment_status: string
    total_amount: string
    discount_applied: string
    staff_name: string | null
    created_at: string
}

interface PageProps {
    auth: any
    bookings: {
        data: Booking[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: { url: string | null; label: string; active: boolean }[]
    }
    filters: {
        search?: string
        status?: string
        date?: string
    }
    sort: {
        column: string
        direction: string
    }
    stats: {
        total_cash_paid: number
        total_gcash_paid: number
        total_unpaid: number
    }
}

export default function BookingsIndex({ auth, bookings, filters, sort, stats }: PageProps) {
    const [search, setSearch] = useState(filters.search || "")
    const [status, setStatus] = useState(filters.status || "all")
    const [date, setDate] = useState<Date | undefined>(filters.date ? new Date(filters.date) : undefined)

    const buildParams = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {}
        const finalSearch = overrides.search !== undefined ? overrides.search : search
        const finalStatus = overrides.status !== undefined ? overrides.status : status
        const finalDate = overrides.date !== undefined ? overrides.date : (date ? format(date, "yyyy-MM-dd") : "")
        const finalSort = overrides.sort !== undefined ? overrides.sort : sort.column
        const finalDirection = overrides.direction !== undefined ? overrides.direction : sort.direction

        if (finalSearch) params.search = finalSearch
        if (finalStatus !== "all") params.status = finalStatus
        if (finalDate) params.date = finalDate
        if (finalSort !== "created_at") params.sort = finalSort
        if (finalDirection !== "desc") params.direction = finalDirection

        return params
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.get(route("bookings.index"), buildParams({ search }), { preserveState: true })
    }

    const handleStatusChange = (value: string) => {
        setStatus(value)
        router.get(route("bookings.index"), buildParams({ status: value }), { preserveState: true })
    }

    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate)
        router.get(route("bookings.index"), buildParams({ date: newDate ? format(newDate, "yyyy-MM-dd") : "" }), { preserveState: true })
    }

    const clearDateFilter = () => {
        setDate(undefined)
        router.get(route("bookings.index"), buildParams({ date: "" }), { preserveState: true })
    }

    const handleSort = (column: string) => {
        const newDirection = sort.column === column && sort.direction === "asc" ? "desc" : "asc"
        router.get(route("bookings.index"), buildParams({ sort: column, direction: newDirection }), { preserveState: true })
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true })
        }
    }

    const SortableHeader = ({ column, children, className = "" }: { column: string; children: React.ReactNode; className?: string }) => {
        const isActive = sort.column === column
        return (
            <TableHead className={cn("font-semibold cursor-pointer hover:bg-gray-100 select-none", className)} onClick={() => handleSort(column)}>
                <div className="flex items-center gap-1">
                    {children}
                    {isActive ? (
                        sort.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                </div>
            </TableHead>
        )
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">All Bookings</h2>}
        >
            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Booking History</CardTitle>
                                    <CardDescription>View and manage all court bookings</CardDescription>
                                </div>
                                <Button
                                    onClick={() => router.visit(route("bookings.create"))}
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                >
                                    + New Booking
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 h-11"
                                        />
                                    </div>
                                </form>

                                {/* Date Filter */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full sm:w-[200px] h-11 justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "MMM dd, yyyy") : "Filter by date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={date}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                        {date && (
                                            <div className="p-2 border-t">
                                                <Button variant="ghost" size="sm" onClick={clearDateFilter} className="w-full">
                                                    Clear Date
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {/* Status Filter */}
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full sm:w-[180px] h-11">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="member">Members Only</SelectItem>
                                        <SelectItem value="non-member">Non-Members Only</SelectItem>
                                        <SelectItem value="guest">Guests Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">Total Bookings</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-700">{bookings.total}</span>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">Total Cash Paid</span>
                                    </div>
                                    <span className="text-2xl font-bold text-emerald-700">₱{parseFloat(String(stats.total_cash_paid)).toFixed(2)}</span>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">Total GCash Paid</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-700">₱{parseFloat(String(stats.total_gcash_paid)).toFixed(2)}</span>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">Total Unpaid</span>
                                    </div>
                                    <span className="text-2xl font-bold text-orange-700">₱{parseFloat(String(stats.total_unpaid)).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-lg border bg-white overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold min-w-[200px]">Customer</TableHead>
                                            <TableHead className="font-semibold min-w-[100px]">Membership</TableHead>
                                            <SortableHeader column="booking_date" className="min-w-[120px]">Date</SortableHeader>
                                            <TableHead className="font-semibold min-w-[100px]">Schedule</TableHead>
                                            <SortableHeader column="games_count" className="text-center min-w-[70px]">Games</SortableHeader>
                                            <TableHead className="font-semibold text-center min-w-[80px]">Trainer</TableHead>
                                            <TableHead className="font-semibold min-w-[100px]">Payment</TableHead>
                                            <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
                                            <SortableHeader column="total_amount" className="text-right min-w-[120px]">Amount</SortableHeader>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                    No bookings found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            bookings.data.map((booking) => (
                                                <TableRow key={booking.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{booking.user_name}</span>
                                                            <span className="text-sm text-gray-500">{booking.user_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={booking.membership_status === "member" ? "default" : "secondary"}
                                                            className={booking.membership_status === "member" ? "bg-emerald-500" : booking.membership_status === "guest" ? "bg-gray-400 text-white" : ""}
                                                        >
                                                            {booking.membership_status.charAt(0).toUpperCase() + booking.membership_status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-700">{booking.booking_date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={booking.schedule_type === "day" ? "border-orange-300 text-orange-600" : "border-indigo-300 text-indigo-600"}>
                                                            {booking.schedule_type === "day" ? "☀️ Day" : "🌙 Night"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">{booking.games_count}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={booking.with_trainer ? "default" : "outline"} className={booking.with_trainer ? "bg-purple-500" : ""}>
                                                            {booking.with_trainer ? "Yes" : "No"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="capitalize text-gray-700 font-medium">{booking.payment_method}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={booking.payment_status === "paid" ? "default" : "secondary"}
                                                            className={booking.payment_status === "paid" ? "bg-green-500" : ""}
                                                        >
                                                            {booking.payment_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-bold text-emerald-600">₱{parseFloat(booking.total_amount).toFixed(2)}</span>
                                                        {parseFloat(booking.discount_applied) > 0 && (
                                                            <div className="text-xs text-green-600">-₱{parseFloat(booking.discount_applied).toFixed(2)} discount</div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {bookings.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-gray-600">
                                        Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                                        {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{" "}
                                        {bookings.total} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(bookings.links[0]?.url)}
                                            disabled={bookings.current_page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(bookings.links[bookings.links.length - 1]?.url)}
                                            disabled={bookings.current_page === bookings.last_page}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
