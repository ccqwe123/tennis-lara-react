import { useState } from "react"
import { router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Calendar, CreditCard, Users, DollarSign, CalendarPlus, Trophy, Coins, TicketPlus, Banknote, Sun, Moon } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import { StatusBadge } from "@/Components/StatusBadge"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import { toast } from "sonner"
import { BookTournamentCourtModal } from "@/Components/BookTournamentCourtModal"

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

interface TournamentBooking {
    id: number
    user_name: string
    tournament_name: string
    reference_number: string
    payment_method: string
    start_date: string
    end_date: string
    amount: string
    membership_status: string
    created_at: string
}
interface Booking {
    id: number
    user_name: string
    user_email: string
    membership_status: string
    reference_number: string
    schedule_type: string
    booking_date: string
    booking_date_raw: string
    games_count: number
    with_trainer: boolean
    payment_method: string
    category: string
    payment_status: string
    total_amount: string
    discount_applied: string
    staff_name: string | null
    created_at: string
}

interface AdminDashboardProps {
    stats: {
        daily_bookings: number
        daily_tournament_bookings: number
        daily_tournament_paid: number
        daily_tournament_unpaid: number
        daily_paid: number
        daily_unpaid: number
        total_members: number
        total_tournaments: number
        pending_list: Booking[]
        pending_tournament_list: TournamentBooking[]
    },
    chart_data: { date: string; count: number }[]
    pie_data: { name: string; value: number }[]
    revenue_chart: { date: string; revenue: number; expenses: number }[]
    todays_players: {
        data: {
            id: number
            user_name: string
            user_type: string
            time: string
            court: string
            status: string
        }[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: { url: string | null; label: string; active: boolean }[]
    }
    filters: {
        player_type: string
        pie_filter?: string
        date_from?: string
        date_to?: string
    }
}

export default function AdminDashboard({ stats, chart_data, pie_data = [], revenue_chart = [], todays_players, filters }: AdminDashboardProps) {
    const manilaDate = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
    console.log(stats)
    const [dateFrom, setDateFrom] = useState(filters.date_from || manilaDate)
    const [dateTo, setDateTo] = useState(filters.date_to || manilaDate)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<Booking | null>(null)
    const [selectedRecordTournament, setSelectedRecordTournament] = useState<TournamentBooking | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isConfirmTournamentOpen, setIsConfirmTournamentOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingType, setBookingType] = useState<'booking' | 'tournament' | null>(null)
    const [showBookTournamentCourtModal, setShowBookTournamentCourtModal] = useState(false)


    const openConfirm = (record: Booking) => {
        setSelectedRecord(record)
        setBookingType('booking')
        setIsConfirmOpen(true)
    }
    const openConfirmTournament = (record: TournamentBooking) => {
        setSelectedRecordTournament(record)
        setBookingType('tournament')
        setIsConfirmTournamentOpen(true)
    }

    const onConfirmBooking = (type: string) => {
        setIsSubmitting(true)

        if (!selectedRecord) return

        const routeName = type === 'booking'
            ? 'payments.verify.booking.pay'
            : 'payments.verify.tournament.pay'

        router.post(route(routeName, selectedRecord.id), { status: "paid" }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsConfirmOpen(false)
                setSelectedRecord(null)
                setIsSubmitting(false)
                toast.success("Payment marked as verified successfully.")
            },
            onError: () => {
                setIsSubmitting(false)
                toast.error("Failed to verify payment.")
            }
        })
    }

    const onConfirmTournamentBooking = (type: string) => {
        setIsSubmitting(true)

        if (!selectedRecordTournament) return

        const routeName = type === 'booking'
            ? 'payments.verify.booking.pay'
            : 'payments.verify.tournament.pay'

        router.post(route(routeName, selectedRecordTournament.id), { status: "paid" }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsConfirmTournamentOpen(false)
                setSelectedRecordTournament(null)
                setIsSubmitting(false)
                toast.success("Payment marked as verified successfully.")
            },
            onError: () => {
                setIsSubmitting(false)
                toast.error("Failed to verify payment.")
            }
        })
    }

    // const confirmPayment = (status: string) => {
    //     if (!selectedRecord) return
    //     setProcessing(true)
    //     const routeName = selectedRecord.type === 'booking'
    //         ? 'payments.verify.booking.pay'
    //         : 'payments.verify.tournament.pay'

    //     router.post(route(routeName, selectedRecord.id), { status }, {
    //         onSuccess: () => {
    //             setIsConfirmOpen(false)
    //             setIsRemovePaymentConfirmOpen(false)
    //             setSelectedRecord(null)
    //             setProcessing(false)
    //             toast.success("Payment marked as verified successfully.")
    //         },
    //         onError: () => {
    //             setProcessing(false)
    //             toast.error("Failed to verify payment.")
    //         }
    //     })
    // }

    const handleTabChange = (value: string) => {
        router.get('/dashboard', { player_type: value }, { preserveState: true, preserveScroll: true })
    }

    const handlePieFilterChange = (value: string) => {
        router.get('/dashboard', { pie_filter: value, player_type: filters.player_type }, { preserveState: true, preserveScroll: true })
    }

    const totalPie = pie_data.reduce((sum, d) => sum + d.value, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    Admin Dashboard
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-end w-full md:w-auto">

                    {/* From Date */}
                    <div className="w-full sm:w-[160px]">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            From Date
                        </label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* To Date */}
                    <div className="w-full sm:w-[160px]">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            To Date
                        </label>
                        <Input
                            type="date"
                            max={manilaDate}
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Button */}
                    <Button
                        onClick={() => {
                            router.get('/dashboard', {
                                date_from: dateFrom,
                                date_to: dateTo
                            }, { preserveState: true, preserveScroll: true })
                        }}
                        className="w-full sm:w-auto"
                    >
                        Apply Filter
                    </Button>

                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <a href={`/bookings?date=${manilaDate}`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Court Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_bookings}</div>
                            <p className="text-xs text-muted-foreground">Today's total bookings</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/bookings?date=${manilaDate}&paymentStatus=paid`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Bookings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_paid || 0}</div>
                            <p className="text-xs text-muted-foreground">Paid bookings for today</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/bookings?date=${manilaDate}&paymentStatus=pending`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unpaid Bookings</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_unpaid || 0}</div>
                            <p className="text-xs text-muted-foreground">Pending payments for today</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/users`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_members}</div>
                            <p className="text-xs text-muted-foreground">Active members</p>
                        </CardContent>
                    </Card>
                </a>

                <a href={`/tournaments/manage?date_from=${dateFrom}&date_to=${dateTo}`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Tournament Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_tournament_bookings}</div>
                            <p className="text-xs text-muted-foreground">Today's total bookings</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/bookings?date=${manilaDate}&paymentStatus=paid`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Tournament Bookings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_tournament_paid}</div>
                            <p className="text-xs text-muted-foreground">Paid tournament bookings for today</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/bookings?date=${manilaDate}&paymentStatus=pending`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unpaid Tournament Bookings</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daily_tournament_unpaid}</div>
                            <p className="text-xs text-muted-foreground">Pending tournament payments for today</p>
                        </CardContent>
                    </Card>
                </a>
                <a href={`/users`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tournaments}</div>
                            <p className="text-xs text-muted-foreground">Active tournaments</p>
                        </CardContent>
                    </Card>
                </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Card className="col-span-5 md:col-span-2 h-[450px] flex flex-col overflow-hidden !gap-0 pb-0">
                    <CardHeader className="sticky top-0 bg-white z-10 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Unpaid Court Booking</CardTitle>
                                <CardDescription>
                                    List of unpaid court bookings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-0 py-0 flex-grow overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b z-10">
                                <tr>
                                    <th style={{ width: '70%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Name</th>
                                    <th style={{ width: '20%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Amount</th>
                                    <th style={{ width: '10%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.pending_list.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">No unpaid registrations found for this date.</td>
                                    </tr>
                                ) : (
                                    stats.pending_list.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-xs text-gray-900">{booking.user_name}</span>
                                                    <span className="text-xs text-gray-500">{booking.category} - {booking.schedule_type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge type="payment_method" value={booking.total_amount} />
                                            </td>
                                            <td className="p-4">
                                                <Button
                                                    onClick={() => openConfirm(booking)}
                                                >
                                                    Mark as Paid
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                {/* unpaid tournament list */}
                <Card className="col-span-5 md:col-span-2 h-[450px] flex flex-col overflow-hidden !gap-0 pb-0">
                    <CardHeader className="sticky top-0 bg-white z-10 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Unpaid Tournament Booking</CardTitle>
                                <CardDescription>
                                    List of unpaid tournament bookings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 py-0 flex-grow overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b z-10">
                                <tr>
                                    <th style={{ width: '70%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Name</th>
                                    <th style={{ width: '20%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Amount</th>
                                    <th style={{ width: '10%' }} className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.pending_tournament_list.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">No unpaid registrations found for this date.</td>
                                    </tr>
                                ) : (
                                    stats.pending_tournament_list.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-xs text-gray-900">{booking.tournament_name}</span>
                                                    <span className="font-medium text-xs text-gray-900">{booking.user_name}</span>
                                                    <span className="text-xs text-gray-500">{booking.membership_status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge type="payment_method" value={booking.amount} />
                                            </td>
                                            <td className="p-4">
                                                <Button
                                                    onClick={() => openConfirmTournament(booking)}
                                                >
                                                    Mark as Paid
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <Card className="col-span-5 md:col-span-2 h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Perform quick actions
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="pt-6 border-t">
                            <div className="grid grid-cols-1 gap-2">
                                <a href="/bookings/create" className="bg-primary text-white h-12 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    New Court Booking
                                </a>
                                <a href="/tournaments/create" className="bg-yellow-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Add Tournament
                                </a>
                                <button onClick={() => setShowBookTournamentCourtModal(true)} className="bg-lime-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input px-4 py-2">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Book Tournament Court
                                </button>
                                <a href="/payments/verify/tournament" className="bg-blue-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Coins className="mr-2 h-4 w-4" />
                                    Verify Court Booking Payments
                                </a>
                                <a href="/payments/verify/tournament-court" className="bg-teal-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Users className="mr-2 h-4 w-4" />
                                    Verify Tournament Court Booking
                                </a>
                                <a href="/memberships/create" className="bg-red-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <TicketPlus className="mr-2 h-4 w-4" />
                                    Add Memberships
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Bar Chart */}
                <Card className="col-span-4 h-full">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Daily bookings for the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chart_data}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-4 md:col-span-3 h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Bookings by Player Type</CardTitle>
                                <CardDescription>
                                    Distribution of members, non-members, and guests
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {totalPie === 0 ? (
                            <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                                No booking data available.
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Pie chart — smaller on mobile */}
                                <div className="w-full md:flex-1 md:min-w-0">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={pie_data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pie_data.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => {
                                                    const v = Number(value ?? 0)
                                                    return [`${v} (${totalPie > 0 ? Math.round((v / totalPie) * 100) : 0}%)`]
                                                }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Summary stats: 2-col grid on mobile, vertical list on md+ */}
                                <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-6 md:shrink-0">
                                    {pie_data.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{entry.name}</p>
                                                <p className="text-xl font-bold">{entry.value}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {totalPie > 0 ? Math.round((entry.value / totalPie) * 100) : 0}% of total
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/* Quick Actions & Player List */}
            <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
                <Card className="col-span-7 h-full">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Today's Players</CardTitle>
                                <CardDescription>List of players booked for today</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <Tabs defaultValue={filters.player_type || "all"} className="w-full" onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="member">Mem</TabsTrigger>
                                <TabsTrigger value="non-member">Non</TabsTrigger>
                                <TabsTrigger value="guest">Guest</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.player_type || "all"} className="mt-4 flex-1">
                                <div className="space-y-4">
                                    {todays_players.data.length > 0 ? (
                                        todays_players.data.map((player) => (
                                            <div key={player.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-sm">{player.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{player.time} - {player.court}</p>
                                                </div>
                                                <Badge variant={player.status === 'paid' ? 'default' : 'secondary'} className={player.status === 'paid' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                    {player.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No players found.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Pagination */}
                        <div className="mt-auto pt-4">
                            {todays_players.last_page > 1 && (
                                <Pagination className="w-auto mx-0 justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={todays_players.links[0].url || '#'}
                                                isActive={!todays_players.links[0].url}
                                                className={!todays_players.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                preserveState
                                                preserveScroll
                                            />
                                        </PaginationItem>

                                        {todays_players.links.slice(1, -1).map((link, i) => {
                                            if (link.label === '...') {
                                                return (
                                                    <PaginationItem key={i}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )
                                            }
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        href={link.url || '#'}
                                                        isActive={link.active}
                                                        preserveState
                                                        preserveScroll
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                href={todays_players.links[todays_players.links.length - 1].url || '#'}
                                                isActive={!todays_players.links[todays_players.links.length - 1].url}
                                                className={!todays_players.links[todays_players.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                                preserveState
                                                preserveScroll
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue vs Expenses Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue vs Expenses</CardTitle>
                    <CardDescription>Daily revenue (bookings + memberships) compared to expenses over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    {revenue_chart.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                            No revenue or expense data available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenue_chart} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `₱${v.toLocaleString()}`}
                                    width={70}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const v = Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                        const n = String(name ?? '')
                                        return [`₱${v}`, n.charAt(0).toUpperCase() + n.slice(1)]
                                    }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <BookTournamentCourtModal
                open={showBookTournamentCourtModal}
                onClose={() => setShowBookTournamentCourtModal(false)}
            />

            {/* booking modal */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        {selectedRecord && (
                            <DialogTitle className="text-xl font-bold">{selectedRecord.reference_number}</DialogTitle>
                        )}
                        <DialogDescription>
                            Reference Number
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                        <div className="space-y-4 py-4">
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Customer </h4>
                                <div className="flex items-center justify-between" >
                                    <span className="font-medium text-gray-900" >
                                        {selectedRecord.user_name}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 space-y-3" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Booking Details </h4>

                                <div className="grid grid-cols-2 gap-3 text-sm" >
                                    <div>
                                        <span className="text-gray-500" > Date </span>
                                        <p className="font-medium text-gray-900" > {selectedRecord.booking_date ? format(selectedRecord.booking_date, "MMMM d, yyyy") : "-"} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > Time Slot </span>
                                        <p className="font-medium text-gray-900 flex items-center gap-1" >
                                            {
                                                selectedRecord.schedule_type === "day" ? (
                                                    <><Sun className="h-4 w-4 text-orange-500" /> Day(6AM - 6PM) </>
                                                ) : (
                                                    <><Moon className="h-4 w-4 text-indigo-500" /> Night(6PM - 10PM) </>
                                                )}
                                        </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > Number of Games </span>
                                        <p className="font-medium text-gray-900" > {selectedRecord.games_count} {selectedRecord.games_count === 1 ? "game" : "games"} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > Category </span>
                                        <p className="font-medium text-gray-900 capitalize" > {selectedRecord.category} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > With Trainer </span>
                                        <p className="font-medium text-gray-900" > {selectedRecord.with_trainer ? "Yes" : "No"} </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Payment </h4>

                                <div className="flex items-center gap-2" >
                                    {
                                        selectedRecord.payment_method === "cash" ? (
                                            <><Banknote className="h-5 w-5 text-emerald-600" /> <span className="font-medium"> Cash </span></>
                                        ) : (
                                            <><CreditCard className="h-5 w-5 text-blue-500" /> <span className="font-medium" > GCash </span></>
                                        )}
                                </div>

                                <div className="border-t border-gray-200 pt-3 space-y-2" >
                                    <div className="flex justify-between text-sm" >
                                        <span className="text-gray-500" > Amount to Pay </span>
                                        <span className="font-medium" >₱{selectedRecord.total_amount} </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => onConfirmBooking('booking')}
                            disabled={isSubmitting}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                        >
                            {isSubmitting ? "Processing..." : `Mark as Paid - ₱${selectedRecord?.total_amount}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* tournament modal */}
            <Dialog open={isConfirmTournamentOpen} onOpenChange={setIsConfirmTournamentOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        {selectedRecordTournament && (
                            <DialogTitle className="text-xl font-bold">{selectedRecordTournament.reference_number}</DialogTitle>
                        )}
                        <DialogDescription>
                            Reference Number
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecordTournament && (
                        <div className="space-y-4 py-4">
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Customer </h4>
                                <div className="flex items-center justify-between" >
                                    <span className="font-medium text-gray-900" >
                                        {selectedRecordTournament.user_name}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 space-y-3" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Tournament Details </h4>

                                <div className="grid grid-cols-2 gap-3 text-sm" >
                                    <div>
                                        <span className="text-gray-500" > Tournament Name </span>
                                        <p className="font-medium text-gray-900" > {selectedRecordTournament.tournament_name} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > Amount to Pay </span>
                                        <p className="font-medium text-gray-900" > {selectedRecordTournament.amount} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > Start Date </span>
                                        <p className="font-medium text-gray-900" > {format(new Date(selectedRecordTournament.start_date), "PPP")} </p>
                                    </div>
                                    <div >
                                        <span className="text-gray-500" > End Date </span>
                                        <p className="font-medium text-gray-900" > {format(new Date(selectedRecordTournament.end_date), "PPP")} </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3" >
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Payment </h4>

                                <div className="flex items-center gap-2" >
                                    {
                                        selectedRecordTournament.payment_method === "cash" ? (
                                            <><Banknote className="h-5 w-5 text-emerald-600" /> <span className="font-medium"> Cash </span></>
                                        ) : (
                                            <><CreditCard className="h-5 w-5 text-blue-500" /> <span className="font-medium" > GCash </span></>
                                        )}
                                </div>

                                <div className="border-t border-gray-200 pt-3 space-y-2" >
                                    <div className="flex justify-between text-sm" >
                                        <span className="text-gray-500" > Amount to Pay </span>
                                        <span className="font-medium" >₱{selectedRecordTournament.amount} </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => onConfirmTournamentBooking('tournament')}
                            disabled={isSubmitting}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                        >
                            {isSubmitting ? "Processing..." : `Mark as Paid - ₱${selectedRecord?.total_amount}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
