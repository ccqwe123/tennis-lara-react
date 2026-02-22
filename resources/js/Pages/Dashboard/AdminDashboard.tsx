import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Calendar, CreditCard, Users, DollarSign, CalendarPlus, Trophy, Coins, TicketPlus } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

interface AdminDashboardProps {
    stats: {
        daily_bookings: number
        daily_paid: number
        daily_unpaid: number
        total_members: number
    }
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
        pie_filter: string
    }
}

export default function AdminDashboard({ stats, chart_data, pie_data = [], revenue_chart = [], todays_players, filters }: AdminDashboardProps) {
    const handleTabChange = (value: string) => {
        router.get('/dashboard', { player_type: value }, { preserveState: true, preserveScroll: true })
    }

    const handlePieFilterChange = (value: string) => {
        router.get('/dashboard', { pie_filter: value, player_type: filters.player_type }, { preserveState: true, preserveScroll: true })
    }

    const totalPie = pie_data.reduce((sum, d) => sum + d.value, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <Select
                    value={filters.pie_filter || "today"}
                    onValueChange={handlePieFilterChange}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_bookings}</div>
                        <p className="text-xs text-muted-foreground">Today's total bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid Bookings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_paid}</div>
                        <p className="text-xs text-muted-foreground">Paid bookings for today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unpaid Bookings</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_unpaid}</div>
                        <p className="text-xs text-muted-foreground">Pending payments for today</p>
                    </CardContent>
                </Card>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-5 h-full">
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
                        <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-1 gap-2">
                                <a href="/bookings/create" className="bg-primary text-white h-12 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    New Booking
                                </a>
                                <a href="/tournaments/create" className="bg-yellow-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Add Tournament
                                </a>
                                <a href="/payments/verify" className="bg-blue-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Coins className="mr-2 h-4 w-4" />
                                    Verify Payments
                                </a>
                                <a href="/memberships/create" className="bg-red-500 h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <TicketPlus className="mr-2 h-4 w-4" />
                                    Add Memberships
                                </a>
                                <a href="/users" className="bg-black h-12 text-white inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-9 px-4 py-2">
                                    <Users className="mr-2 h-4 w-4" />
                                    User List
                                </a>
                            </div>
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
        </div>
    )
}
