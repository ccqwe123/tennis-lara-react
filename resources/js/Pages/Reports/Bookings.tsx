
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter, Printer, Download, Search } from "lucide-react"

import { cn } from "@/lib/utils"

declare var route: any;

import { Button } from "@/Components/ui/button"
import { Calendar } from "@/Components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

interface Booking {
    id: number
    date: string
    time: string
    customer: string
    type: string
    games: number
    with_trainer: string
    total: string
    status: string
}

interface PaginatedBookings {
    data: Booking[]
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

interface Stats {
    total_bookings: number
    total_games: number
    total_paid: number
    total_unpaid: number
}

interface Props {
    auth: any
    bookings: PaginatedBookings
    filters: any
    stats: Stats
}

export default function BookingReports({ auth, bookings, filters, stats }: Props) {
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    )
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    )
    const [type, setType] = useState(filters.type || "all")
    const [status, setStatus] = useState(filters.payment_status || "all")
    const [schedule, setSchedule] = useState(filters.schedule_type || "all")
    const [trainer, setTrainer] = useState(filters.with_trainer || "all")

    const handleFilter = () => {
        router.get(
            route("reports.bookings"),
            {
                date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
                date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
                type,
                payment_status: status,
                schedule_type: schedule,
                with_trainer: trainer,
            },
            { preserveState: true }
        )
    }

    const handleExport = (exportFormat: 'pdf' | 'xlsx') => {
        const queryParams = new URLSearchParams({
            date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
            date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
            type,
            payment_status: status,
            schedule_type: schedule,
            with_trainer: trainer,
            format: exportFormat
        }).toString()

        window.open(route("reports.bookings.export") + "?" + queryParams, '_blank')
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Booking Reports</h2>}>
            <Head title="Booking Reports" />

            <style>{`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; }
                    nav, header, .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; }
                    table { font-size: 10pt; width: 100%; }
                    th, td { padding: 4px 8px !important; border: 1px solid #ddd; }
                    .card { box-shadow: none !important; border: 1px solid #eee !important; break-inside: avoid; }
                }
            `}</style>

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6 main-content">
                {/* Filters - Non-Printable */}
                <Card className="no-print">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Date From */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !dateFrom && "text-muted-foreground")}>
                                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">To Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !dateTo && "text-muted-foreground")}>
                                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer Type</label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="non-member">Non-Member</SelectItem>
                                        <SelectItem value="guest">Guest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Schedule</label>
                                <Select value={schedule} onValueChange={setSchedule}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All times" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Times</SelectItem>
                                        <SelectItem value="day">Day</SelectItem>
                                        <SelectItem value="night">Night</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Trainer */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">With Trainer</label>
                                <Select value={trainer} onValueChange={setTrainer}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setDateFrom(undefined)
                                setDateTo(undefined)
                                setType("all")
                                setStatus("all")
                                setSchedule("all")
                                setTrainer("all")
                                router.visit(route('reports.bookings'))
                            }}>
                                Reset
                            </Button>
                            <Button onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-700">
                                <Search className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Actions */}
                <div className="flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold text-gray-800">Results</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('xlsx')}>
                            <Download className="w-4 h-4 mr-2" /> Excel
                        </Button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
                            <div className="text-2xl font-bold">{stats.total_bookings}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Games</CardTitle>
                            <div className="text-2xl font-bold">{stats.total_games}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
                            <div className="text-2xl font-bold text-emerald-600">₱{stats.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Unpaid / Pending</CardTitle>
                            <div className="text-2xl font-bold text-orange-600">₱{stats.total_unpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Games</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Trainer</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.length > 0 ? (
                                    bookings.data.map((booking) => (
                                        <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{booking.date}</td>
                                            <td className="p-4 align-middle">{booking.time}</td>
                                            <td className="p-4 align-middle font-medium">{booking.customer}</td>
                                            <td className="p-4 align-middle">
                                                <Badge variant="outline">{booking.type}</Badge>
                                            </td>
                                            <td className="p-4 align-middle text-center">{booking.games}</td>
                                            <td className="p-4 align-middle text-center">{booking.with_trainer}</td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={booking.status === 'Paid' ? 'default' : 'secondary'} className={booking.status === 'Paid' ? 'bg-emerald-500' : 'bg-orange-500 text-white'}>
                                                    {booking.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">₱{Number(booking.total).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">No bookings found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                                {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{" "}
                                {bookings.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={bookings.links[0].url || '#'}
                                            isActive={!bookings.links[0].url}
                                            className={!bookings.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {bookings.links.slice(1, -1).map((link, i) => {
                                        // Simple logic to show some pages, ideally we use a smarter ellipsis strategy
                                        // For now, render all or use the labels directly
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
                                            href={bookings.links[bookings.links.length - 1].url || '#'}
                                            isActive={!bookings.links[bookings.links.length - 1].url}
                                            className={!bookings.links[bookings.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}
